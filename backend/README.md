
# ContainerOS Backend

This is the Python backend for ContainerOS, a Docker visualization and management tool with a custom lightweight container runtime.

## Requirements

- Python 3.7+
- Docker installed and running (for Docker Engine functionality)
- GCC compiler (for Mini Docker runtime)
- Flask and related packages (see requirements.txt)

## Installation

1. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Compile the Mini Docker runtime:
   ```
   cd mini_docker && make
   ```

3. Make sure Docker is running and accessible to your user

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

### Container Management (Docker)
- GET /api/containers - List all containers
- POST /api/containers/create - Create a new container
- POST /api/containers/:id/start - Start a container
- POST /api/containers/:id/stop - Stop a container
- DELETE /api/containers/:id - Delete a container
- GET /api/containers/:id/logs - Get container logs

### Mini Docker Container Management
- GET /api/containers?runtime=mini - List all Mini Docker containers
- POST /api/containers/create (with runtime=mini) - Create a new Mini Docker container
- POST /api/containers/:id/start (with runtime=mini) - Start a Mini Docker container
- POST /api/containers/:id/stop (with runtime=mini) - Stop a Mini Docker container
- DELETE /api/containers/:id?runtime=mini - Delete a Mini Docker container
- GET /api/containers/:id/logs?runtime=mini - Get Mini Docker container logs

### Volume Management
- GET /api/volumes - List all volumes
- DELETE /api/volumes/:id - Delete a volume

## WebSocket Events
- system_stats - Real-time system statistics updates
- docker_containers - Real-time Docker container list and stats
- mini_containers - Real-time Mini Docker container list and stats

## Mini Docker Runtime

The Mini Docker runtime is a lightweight container runtime written in C that uses Linux kernel features:

- Process isolation using namespaces (PID, UTS, mount, network)
- Resource limiting using cgroups
- Filesystem isolation using chroot

Features:
- Simple container creation and management
- CPU and memory resource limits
- Basic process isolation
- Integration with the ContainerOS frontend

Note: This is a simplified implementation for educational purposes and lacks many features of production container runtimes.
