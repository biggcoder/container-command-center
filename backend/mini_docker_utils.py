
import os
import subprocess
import json
import uuid
import signal
import time
import psutil
from typing import Dict, List, Optional, Union

# Containers will be stored in this directory structure
MINI_DOCKER_ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "mini_docker_containers")
MINI_DOCKER_RUNTIME = os.path.join(os.path.dirname(os.path.abspath(__file__)), "mini_docker/mini_docker")

# Ensure container directory exists
os.makedirs(MINI_DOCKER_ROOT, exist_ok=True)

# In-memory storage of container metadata
_containers = {}

class MiniDockerManager:
    """Manage Mini Docker containers"""
    
    def __init__(self):
        """Initialize the Mini Docker manager"""
        self._load_containers()
        self._compile_runtime()
    
    def _compile_runtime(self):
        """Compile the Mini Docker runtime if needed"""
        if not os.path.exists(MINI_DOCKER_RUNTIME):
            try:
                subprocess.run(["make", "-C", os.path.dirname(MINI_DOCKER_RUNTIME)], check=True)
                print("Mini Docker runtime compiled successfully")
            except subprocess.SubprocessError as e:
                print(f"Failed to compile Mini Docker runtime: {e}")
    
    def _load_containers(self):
        """Load containers from disk"""
        global _containers
        if not os.path.exists(MINI_DOCKER_ROOT):
            return
            
        for container_id in os.listdir(MINI_DOCKER_ROOT):
            container_path = os.path.join(MINI_DOCKER_ROOT, container_id)
            metadata_path = os.path.join(container_path, "metadata.json")
            
            if os.path.exists(metadata_path):
                try:
                    with open(metadata_path, 'r') as f:
                        metadata = json.load(f)
                        _containers[container_id] = metadata
                        
                        # Update container status by checking if process is still running
                        if metadata.get('pid') and metadata['status'] == 'running':
                            if not self._is_process_running(metadata['pid']):
                                metadata['status'] = 'exited'
                                self._save_container_metadata(container_id, metadata)
                except Exception as e:
                    print(f"Error loading container {container_id}: {e}")
    
    def _save_container_metadata(self, container_id: str, metadata: Dict):
        """Save container metadata to disk"""
        container_path = os.path.join(MINI_DOCKER_ROOT, container_id)
        os.makedirs(container_path, exist_ok=True)
        
        metadata_path = os.path.join(container_path, "metadata.json")
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f)
    
    def _is_process_running(self, pid: int) -> bool:
        """Check if a process is running"""
        try:
            os.kill(pid, 0)
            return True
        except (OSError, ProcessLookupError):
            return False
    
    def _get_container_stats(self, container_id: str) -> Dict:
        """Get container statistics"""
        metadata = _containers.get(container_id)
        if not metadata or metadata['status'] != 'running':
            return {'cpu': 0, 'memory': 0}
            
        try:
            pid = metadata.get('pid')
            if not pid:
                return {'cpu': 0, 'memory': 0}
                
            process = psutil.Process(pid)
            cpu_percent = process.cpu_percent(interval=0.1)
            memory_info = process.memory_info()
            
            return {
                'cpu': cpu_percent,
                'memory': memory_info.rss / (1024 * 1024)  # in MB
            }
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            # Process is gone, update status
            metadata['status'] = 'exited'
            self._save_container_metadata(container_id, metadata)
            return {'cpu': 0, 'memory': 0}
    
    def create_container(self, image: str, name: Optional[str] = None, 
                        cpu_limit: Optional[int] = None, 
                        memory_limit: Optional[int] = None) -> Dict:
        """Create a new container"""
        # Generate container ID and name
        container_id = str(uuid.uuid4())[:12]
        if not name:
            name = f"mini-{container_id[:6]}"
            
        # For simplicity we'll use a basic rootfs
        # In a real implementation, you would extract image contents
        rootfs = os.path.join(MINI_DOCKER_ROOT, container_id, "rootfs")
        os.makedirs(rootfs, exist_ok=True)
        
        # Create a basic binary to run (for demo purpose)
        os.makedirs(os.path.join(rootfs, "bin"), exist_ok=True)
        
        # For now, we'll create a simple script that echoes a message and sleeps
        with open(os.path.join(rootfs, "bin", "init.sh"), 'w') as f:
            f.write('#!/bin/sh\n')
            f.write('echo "Mini Docker container started"\n')
            f.write('sleep 3600\n')  # Sleep for an hour
        
        os.chmod(os.path.join(rootfs, "bin", "init.sh"), 0o755)
        
        # Save container metadata
        metadata = {
            'id': container_id,
            'name': name,
            'image': image,
            'status': 'created',
            'created': time.time() * 1000,  # milliseconds
            'cpu': 0,
            'memory': 0,
            'cpu_limit': cpu_limit,
            'memory_limit': memory_limit,
            'pid': None,
            'ports': []
        }
        
        _containers[container_id] = metadata
        self._save_container_metadata(container_id, metadata)
        
        return metadata
    
    def start_container(self, container_id: str) -> Dict:
        """Start a container"""
        if container_id not in _containers:
            return {'success': False, 'error': 'Container not found'}
            
        metadata = _containers[container_id]
        
        # Can't start an already running container
        if metadata['status'] == 'running':
            return {'success': False, 'error': 'Container already running'}
            
        rootfs = os.path.join(MINI_DOCKER_ROOT, container_id, "rootfs")
        
        # Start the container
        try:
            # In a real implementation, you would use proper command and args
            # from the container configuration
            process = subprocess.Popen(
                [MINI_DOCKER_RUNTIME, rootfs, "/bin/init.sh"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            
            # Update metadata
            metadata['status'] = 'running'
            metadata['pid'] = process.pid
            self._save_container_metadata(container_id, metadata)
            
            return {'success': True, 'container': metadata}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def stop_container(self, container_id: str) -> Dict:
        """Stop a container"""
        if container_id not in _containers:
            return {'success': False, 'error': 'Container not found'}
            
        metadata = _containers[container_id]
        
        # Can't stop a container that's not running
        if metadata['status'] != 'running':
            return {'success': False, 'error': 'Container not running'}
            
        pid = metadata.get('pid')
        if not pid:
            metadata['status'] = 'exited'
            self._save_container_metadata(container_id, metadata)
            return {'success': True, 'container': metadata}
            
        # Send SIGTERM to the container process
        try:
            os.kill(pid, signal.SIGTERM)
            
            # Wait for the process to terminate
            for _ in range(5):
                if not self._is_process_running(pid):
                    break
                time.sleep(0.5)
                
            # Force kill if still running
            if self._is_process_running(pid):
                os.kill(pid, signal.SIGKILL)
                
            # Update metadata
            metadata['status'] = 'exited'
            metadata['pid'] = None
            self._save_container_metadata(container_id, metadata)
            
            return {'success': True, 'container': metadata}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def delete_container(self, container_id: str) -> Dict:
        """Delete a container"""
        if container_id not in _containers:
            return {'success': False, 'error': 'Container not found'}
            
        metadata = _containers[container_id]
        
        # If running, stop it first
        if metadata['status'] == 'running':
            self.stop_container(container_id)
            
        # Remove container directory
        try:
            import shutil
            shutil.rmtree(os.path.join(MINI_DOCKER_ROOT, container_id))
            
            # Remove from in-memory storage
            del _containers[container_id]
            
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def list_containers(self) -> List[Dict]:
        """List all containers"""
        containers = []
        
        for container_id, metadata in _containers.items():
            # If container is running, get stats
            if metadata['status'] == 'running':
                stats = self._get_container_stats(container_id)
                metadata['cpu'] = stats['cpu']
                metadata['memory'] = stats['memory']
                
            containers.append(metadata)
            
        return containers
    
    def get_container_logs(self, container_id: str) -> Dict:
        """Get container logs"""
        if container_id not in _containers:
            return {'logs': [], 'error': 'Container not found'}
            
        # In a real implementation, you would read logs from a file
        # Here we'll just return a mock log
        return {
            'logs': [
                {
                    'timestamp': time.strftime('%Y-%m-%dT%H:%M:%S'),
                    'type': 'INFO',
                    'message': f"[{_containers[container_id]['name']}] Mini Docker container started"
                }
            ]
        }

# Initialize the manager
mini_docker_manager = MiniDockerManager()
