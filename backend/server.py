
from flask import Flask, jsonify, request
from flask_socketio import SocketIO
from flask_cors import CORS
import eventlet
import json
import time
import threading

from monitor import SystemMonitor
from container_utils import ContainerManager

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Initialize monitoring and container management
system_monitor = SystemMonitor()
container_manager = ContainerManager()

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
        containers = container_manager.list_containers_with_stats()
        
        # Update history
        update_history(system_stats)
        
        # Emit data via WebSocket
        socketio.emit('system_stats', system_stats)
        socketio.emit('containers', containers)
        
        eventlet.sleep(1)

# API Routes
@app.route('/api/cpu', methods=['GET'])
def get_cpu():
    return jsonify(system_monitor.get_cpu_stats())

@app.route('/api/memory', methods=['GET'])
def get_memory():
    return jsonify(system_monitor.get_memory_stats())

@app.route('/api/gpu', methods=['GET'])
def get_gpu():
    return jsonify(system_monitor.get_gpu_stats())

@app.route('/api/disk', methods=['GET'])
def get_disk():
    return jsonify(system_monitor.get_disk_stats())

@app.route('/api/history', methods=['GET'])
def get_history():
    return jsonify(history_buffer)

@app.route('/api/containers', methods=['GET'])
def get_containers():
    return jsonify(container_manager.list_containers())

@app.route('/api/containers/<container_id>/start', methods=['POST'])
def start_container(container_id):
    result = container_manager.start_container(container_id)
    return jsonify({"success": result})

@app.route('/api/containers/<container_id>/stop', methods=['POST'])
def stop_container(container_id):
    result = container_manager.stop_container(container_id)
    return jsonify({"success": result})

@app.route('/api/containers/<container_id>/delete', methods=['DELETE'])
def delete_container(container_id):
    result = container_manager.delete_container(container_id)
    return jsonify({"success": result})

@app.route('/api/containers/<container_id>/logs', methods=['GET'])
def get_logs(container_id):
    logs = container_manager.get_container_logs(container_id)
    return jsonify(logs)

@app.route('/api/containers/create', methods=['POST'])
def create_container():
    data = request.get_json()
    result = container_manager.create_container(
        image=data.get('image'),
        name=data.get('name'),
        ports=data.get('ports', {}),
        cpu_limit=data.get('cpu_limit'),
        memory_limit=data.get('memory_limit'),
        gpu=data.get('gpu', False)
    )
    return jsonify(result)

@app.route('/api/volumes', methods=['GET'])
def get_volumes():
    return jsonify(container_manager.list_volumes())

@app.route('/api/volumes/<volume_id>', methods=['DELETE'])
def delete_volume(volume_id):
    result = container_manager.delete_volume(volume_id)
    return jsonify({"success": result})

if __name__ == '__main__':
    # Start background monitoring thread
    threading.Thread(target=background_monitoring, daemon=True).start()
    
    # Start Flask-SocketIO server
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
