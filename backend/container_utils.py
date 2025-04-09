
import docker
import json
from datetime import datetime

class ContainerManager:
    """Manage Docker containers via docker-py"""
    
    def __init__(self):
        try:
            self.client = docker.from_env()
        except docker.errors.DockerException:
            print("Error connecting to Docker. Make sure Docker is running.")
            self.client = None
        
    def _format_container(self, container):
        """Format container data for frontend"""
        try:
            status = container.status
            stats = container.stats(stream=False)
            
            # Calculate CPU percentage
            cpu_delta = stats['cpu_stats']['cpu_usage']['total_usage'] - stats['precpu_stats']['cpu_usage']['total_usage']
            system_delta = stats['cpu_stats']['system_cpu_usage'] - stats['precpu_stats']['system_cpu_usage']
            cpu_percent = 0.0
            if system_delta > 0 and cpu_delta > 0:
                cpu_percent = (cpu_delta / system_delta) * 100.0
                
            # Calculate memory usage
            memory_usage = stats['memory_stats'].get('usage', 0)
            memory_limit = stats['memory_stats'].get('limit', 1)
            memory_mb = memory_usage / (1024 * 1024)  # Convert to MB
            
            # Get port mappings
            ports = []
            container_ports = container.attrs['HostConfig']['PortBindings'] or {}
            for container_port, host_bindings in container_ports.items():
                if host_bindings:
                    for binding in host_bindings:
                        ports.append(f"{binding['HostPort']}:{container_port.split('/')[0]}")
            
            created = datetime.fromisoformat(container.attrs['Created'].replace('Z', '+00:00')).timestamp() * 1000
            
            return {
                'id': container.id,
                'name': container.name,
                'image': container.image.tags[0] if container.image.tags else container.image.id,
                'status': status,
                'created': created,
                'cpu': round(cpu_percent, 1),
                'memory': round(memory_mb, 1),
                'ports': ports
            }
        except Exception as e:
            # Return minimal data if error occurs during stats collection
            return {
                'id': container.id,
                'name': container.name,
                'image': container.image.tags[0] if hasattr(container, 'image') and container.image.tags else "unknown",
                'status': container.status if hasattr(container, 'status') else "unknown",
                'created': 0,
                'cpu': 0,
                'memory': 0,
                'ports': [],
                'error': str(e)
            }
    
    def list_containers(self):
        """List all containers"""
        if not self.client:
            return []
        
        containers = []
        for container in self.client.containers.list(all=True):
            containers.append(self._format_container(container))
        return containers
    
    def list_containers_with_stats(self):
        """List containers with current stats"""
        return self.list_containers()
    
    def get_container_logs(self, container_id, tail=100):
        """Get logs for a specific container"""
        if not self.client:
            return {"logs": []}
            
        try:
            container = self.client.containers.get(container_id)
            logs = container.logs(tail=tail, timestamps=True).decode('utf-8').strip().split('\n')
            
            formatted_logs = []
            for log in logs:
                if log:
                    # Try to extract timestamp from the beginning of the log
                    try:
                        timestamp, message = log.split(' ', 1)
                        # Determine log type by keywords
                        if 'ERROR' in message or 'FATAL' in message or 'EXCEPTION' in message:
                            log_type = 'ERROR'
                        elif 'WARN' in message:
                            log_type = 'WARN'
                        elif 'DEBUG' in message:
                            log_type = 'DEBUG'
                        else:
                            log_type = 'INFO'
                            
                        formatted_logs.append({
                            'timestamp': timestamp,
                            'type': log_type,
                            'message': f"[{container.name}] {message}"
                        })
                    except ValueError:
                        # If timestamp parsing fails, use the whole line as message
                        formatted_logs.append({
                            'timestamp': datetime.now().isoformat(),
                            'type': 'INFO',
                            'message': f"[{container.name}] {log}"
                        })
            
            return {"logs": formatted_logs}
        except docker.errors.NotFound:
            return {"error": "Container not found"}
        except Exception as e:
            return {"error": str(e)}
    
    def start_container(self, container_id):
        """Start a container"""
        if not self.client:
            return False
            
        try:
            container = self.client.containers.get(container_id)
            container.start()
            return True
        except Exception:
            return False
    
    def stop_container(self, container_id):
        """Stop a container"""
        if not self.client:
            return False
            
        try:
            container = self.client.containers.get(container_id)
            container.stop()
            return True
        except Exception:
            return False
    
    def delete_container(self, container_id):
        """Delete a container"""
        if not self.client:
            return False
            
        try:
            container = self.client.containers.get(container_id)
            container.remove(force=True)
            return True
        except Exception:
            return False
    
    def create_container(self, image, name=None, ports=None, cpu_limit=None, memory_limit=None, gpu=False):
        """Create a new container"""
        if not self.client:
            return {"success": False, "error": "Docker client not available"}
            
        try:
            # Convert memory limit to bytes if provided
            mem_limit = None
            if memory_limit:
                mem_limit = f"{memory_limit}m"
                
            # Set CPU limit if provided (in CPU shares)
            cpu_shares = None
            if cpu_limit:
                cpu_shares = int(cpu_limit * 1024)
                
            # GPU runtime settings if GPU is enabled
            device_requests = None
            if gpu:
                device_requests = [docker.types.DeviceRequest(count=-1, capabilities=[['gpu']])]
                
            # Create the container
            container = self.client.containers.run(
                image=image,
                name=name,
                ports=ports,
                mem_limit=mem_limit,
                cpu_shares=cpu_shares,
                device_requests=device_requests,
                detach=True
            )
            
            return {
                "success": True,
                "container": self._format_container(container)
            }
        except docker.errors.ImageNotFound:
            return {"success": False, "error": f"Image '{image}' not found"}
        except docker.errors.APIError as e:
            return {"success": False, "error": str(e)}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def list_volumes(self):
        """List all Docker volumes"""
        if not self.client:
            return []
            
        volumes = []
        for volume in self.client.volumes.list():
            # Get containers using this volume
            used_by = []
            for container in self.client.containers.list(all=True):
                for mount in container.attrs['Mounts']:
                    if mount['Type'] == 'volume' and mount['Name'] == volume.name:
                        used_by.append(container.name)
            
            # Try to get volume size (if possible)
            try:
                # This is a rough estimate and may not work on all systems
                inspect_data = volume.attrs
                mountpoint = inspect_data['Mountpoint']
                size = "Unknown"  # Default value
                
                # Try to get size using docker system df
                try:
                    import subprocess
                    output = subprocess.check_output(['docker', 'system', 'df', '-v']).decode('utf-8')
                    for line in output.split('\n'):
                        if volume.name in line:
                            parts = line.split()
                            if len(parts) >= 3:
                                size = parts[2]
                except Exception:
                    pass
                
                volumes.append({
                    'id': volume.id,
                    'name': volume.name,
                    'driver': volume.attrs['Driver'],
                    'mountpoint': mountpoint,
                    'size': size,
                    'created': volume.attrs['CreatedAt'],
                    'usedBy': used_by
                })
            except Exception as e:
                volumes.append({
                    'id': volume.id,
                    'name': volume.name,
                    'driver': volume.attrs['Driver'],
                    'mountpoint': volume.attrs.get('Mountpoint', 'Unknown'),
                    'size': 'Unknown',
                    'created': volume.attrs.get('CreatedAt', 'Unknown'),
                    'usedBy': used_by,
                    'error': str(e)
                })
        
        return volumes
    
    def delete_volume(self, volume_id):
        """Delete a Docker volume"""
        if not self.client:
            return False
            
        try:
            volume = self.client.volumes.get(volume_id)
            volume.remove()
            return True
        except Exception:
            return False
