
# ContainerOS - Docker Visualization and Management Tool

ContainerOS is a Docker visualization and management tool that provides an intuitive interface for monitoring and controlling Docker containers. It includes a frontend web application and a backend server.

## Features

- Real-time monitoring of system resources (CPU, memory, disk, GPU)
- Container management (create, start, stop, delete)
- Container logs viewing
- Volume management
- Support for both Docker Engine and a simplified container runtime

## Requirements

- Docker Desktop for Windows
- Python 3.7+
- Node.js 18+ and npm
- Modern web browser

## Setup and Installation

### Backend Setup

1. Install Python dependencies:
   ```
   cd backend
   pip install -r requirements.txt
   ```

2. Start the backend server:
   ```
   python server.py
   ```

### Frontend Setup

1. Install frontend dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Access the application at http://localhost:8080

## Windows Deployment Notes

This application primarily uses Docker Engine to manage containers on Windows. The Mini Docker runtime feature is only fully supported on Linux systems as it relies on Linux-specific kernel features.

When running on Windows:
- Docker Desktop must be installed and running
- Container operations will use the Docker Engine API
- System monitoring will show Windows host metrics
- Mini Docker runtime option is available in the interface but has limited functionality on Windows

## Usage

1. Navigate to the web interface at http://localhost:8080
2. Use the sidebar to access different sections:
   - Dashboard: Overview of system and container status
   - Containers: Manage Docker containers
   - Stats: Detailed system metrics
   - Logs: View container logs
   - Volumes: Manage Docker volumes
   - Settings: Application settings

