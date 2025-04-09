
from flask import Flask, jsonify, request
from flask_socketio import SocketIO
from flask_cors import CORS
import eventlet
import json
import time
import threading
import platform

from monitor import SystemMonitor
from container_utils import ContainerManager

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Check if running on Windows
is_windows = platform.system() == "Windows"

# Initialize monitoring and container management
system_monitor = SystemMonitor()
container_manager = ContainerManager()

# Initialize mini_docker_manager only on Linux
mini_docker_manager = None
if not is_windows:
    # Only import and initialize on Linux
    try:
        from mini_docker_utils import mini_docker_manager
    except ImportError:
        print("Warning: Mini Docker runtime not available on this platform")
else:
    print("Running on Windows: Mini Docker runtime will be limited to API compatibility only")
    # Define a dummy mini_docker_manager for Windows compatibility
    class DummyMiniDockerManager:
        def list_containers(self):
            return {"containers": [], "message": "Mini Docker runtime not available on Windows"}
        
        def create_container(self, **kwargs):
            return {"success": False, "message": "Mini Docker runtime not available on Windows", "container_id": None}
        
        def start_container(self, container_id):
            return {"success": False, "message": "Mini Docker runtime not available on Windows"}
        
        def stop_container(self, container_id):
            return {"success": False, "message": "Mini Docker runtime not available on Windows"}
        
        def delete_container(self, container_id):
            return {"success": False, "message": "Mini Docker runtime not available on Windows"}
        
        def get_container_logs(self, container_id):
            return {"logs": "", "message": "Mini Docker runtime not available on Windows"}
    
    mini_docker_manager = DummyMiniDockerManager()

# Store historical data (last 60 seconds, 1 sample per second)
history_buffer = {
    'cpu': [],
    'memory': [],
    'gpu': [],
    'timestamps': []
}

def update_history(stats):
    """Update history buffer with latest stats"""
    current_time = time.strftime('%H:%M:%S')
    
    history_buffer['timestamps'].append(current_time)
    history_buffer['cpu'].append(stats['cpu'])
    history_buffer['memory'].append(stats['memory']['percent'])
    if 'gpu' in stats:
        history_buffer['gpu'].append(stats['gpu'])
    else:
        history_buffer['gpu'].append(0)
        
    # Keep only last 60 samples
    if len(history_buffer['timestamps']) > 60:
        history_buffer['timestamps'].pop(0)
        history_buffer['cpu'].pop(0)
        history_buffer['memory'].pop(0)
        history_buffer['gpu'].pop(0)

def background_monitoring():
    """Background thread to emit system stats every second"""
    while True:
        system_stats = system_monitor.get_stats()
        docker_containers = container_manager.list_containers_with_stats()
        
        # Get mini containers if not on Windows
        if mini_docker_manager:
            mini_containers = mini_docker_manager.list_containers()
        else:
            mini_containers = {"containers": []}
        
        # Update history
        update_history(system_stats)
        
        # Emit data via WebSocket
        socketio.emit('system_stats', system_stats)
        socketio.emit('docker_containers', docker_containers)
        socketio.emit('mini_containers', mini_containers)
        
        eventlet.sleep(1)

# ... keep existing code (API routes for CPU, memory, GPU, disk, and history)

# Docker container routes
@app.route('/api/containers', methods=['GET'])
def get_containers():
    # Get runtime type from query params (default to docker)
    runtime = request.args.get('runtime', 'docker')
    
    if runtime == 'mini':
        if mini_docker_manager:
            return jsonify(mini_docker_manager.list_containers())
        else:
            return jsonify({"containers": [], "message": "Mini Docker runtime not available on this platform"})
    else:
        return jsonify(container_manager.list_containers())

@app.route('/api/containers/<container_id>/start', methods=['POST'])
def start_container(container_id):
    # Get runtime type from request body
    data = request.get_json() or {}
    runtime = data.get('runtime', 'docker')
    
    if runtime == 'mini':
        if mini_docker_manager:
            result = mini_docker_manager.start_container(container_id)
        else:
            result = {"success": False, "message": "Mini Docker runtime not available on this platform"}
    else:
        result = container_manager.start_container(container_id)
        
    return jsonify(result)

@app.route('/api/containers/<container_id>/stop', methods=['POST'])
def stop_container(container_id):
    # Get runtime type from request body
    data = request.get_json() or {}
    runtime = data.get('runtime', 'docker')
    
    if runtime == 'mini':
        if mini_docker_manager:
            result = mini_docker_manager.stop_container(container_id)
        else:
            result = {"success": False, "message": "Mini Docker runtime not available on this platform"}
    else:
        result = container_manager.stop_container(container_id)
        
    return jsonify(result)

@app.route('/api/containers/<container_id>/delete', methods=['DELETE'])
def delete_container(container_id):
    # Get runtime type from query params
    runtime = request.args.get('runtime', 'docker')
    
    if runtime == 'mini':
        if mini_docker_manager:
            result = mini_docker_manager.delete_container(container_id)
        else:
            result = {"success": False, "message": "Mini Docker runtime not available on this platform"}
    else:
        result = container_manager.delete_container(container_id)
        
    return jsonify(result)

@app.route('/api/containers/<container_id>/logs', methods=['GET'])
def get_logs(container_id):
    # Get runtime type from query params
    runtime = request.args.get('runtime', 'docker')
    
    if runtime == 'mini':
        if mini_docker_manager:
            logs = mini_docker_manager.get_container_logs(container_id)
        else:
            logs = {"logs": "", "message": "Mini Docker runtime not available on this platform"}
    else:
        logs = container_manager.get_container_logs(container_id)
        
    return jsonify(logs)

@app.route('/api/containers/create', methods=['POST'])
def create_container():
    data = request.get_json()
    
    # Get runtime type from request (default to docker)
    runtime = data.get('runtime', 'docker')
    
    if runtime == 'mini':
        if mini_docker_manager:
            result = mini_docker_manager.create_container(
                image=data.get('image', 'busybox'),
                name=data.get('name'),
                cpu_limit=data.get('cpu_limit'),
                memory_limit=data.get('memory_limit')
            )
        else:
            result = {"success": False, "message": "Mini Docker runtime not available on this platform", "container_id": None}
    else:
        result = container_manager.create_container(
            image=data.get('image'),
            name=data.get('name'),
            ports=data.get('ports', {}),
            cpu_limit=data.get('cpu_limit'),
            memory_limit=data.get('memory_limit'),
            gpu=data.get('gpu', False)
        )
    
    return jsonify(result)

# ... keep existing code (volume management routes)

if __name__ == '__main__':
    # Start background monitoring thread
    threading.Thread(target=background_monitoring, daemon=True).start()
    
    # Start Flask-SocketIO server
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
