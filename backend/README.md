
# ContainerOS Backend

This is the Python backend for ContainerOS, a Docker visualization and management tool.

## Requirements

- Python 3.7+
- Docker installed and running
- Flask and related packages (see requirements.txt)

## Installation

1. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Make sure Docker is running and accessible to your user

## Usage

1. Start the backend server:
   ```
   python server.py
   ```

2. The server will run on http://localhost:5000 with the following endpoints:
   - REST API at /api/...
   - WebSocket connections for real-time updates

## API Endpoints

### System Information
- GET /api/cpu - CPU statistics
- GET /api/memory - Memory statistics
- GET /api/disk - Disk usage
- GET /api/gpu - GPU statistics (if available)
- GET /api/history - Historical system metrics

### Container Management
- GET /api/containers - List all containers
- POST /api/containers/create - Create a new container
- POST /api/containers/:id/start - Start a container
- POST /api/containers/:id/stop - Stop a container
- DELETE /api/containers/:id - Delete a container
- GET /api/containers/:id/logs - Get container logs

### Volume Management
- GET /api/volumes - List all volumes
- DELETE /api/volumes/:id - Delete a volume

## WebSocket Events
- system_stats - Real-time system statistics updates
- containers - Real-time container list and stats
