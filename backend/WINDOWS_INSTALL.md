
# Windows Installation Guide for ContainerOS

This guide will help you set up ContainerOS on a Windows system.

## Prerequisites

1. **Install Docker Desktop for Windows**:
   - Download from [Docker Hub](https://hub.docker.com/editions/community/docker-ce-desktop-windows/)
   - Follow the installation wizard
   - Start Docker Desktop and ensure it's running properly

2. **Install Python 3.7+**:
   - Download from [python.org](https://www.python.org/downloads/windows/)
   - Make sure to check "Add Python to PATH" during installation
   - Verify installation by opening Command Prompt and typing `python --version`

3. **Install Node.js and npm**:
   - Download LTS version from [nodejs.org](https://nodejs.org/)
   - Follow the installation wizard
   - Verify installation with `node --version` and `npm --version`

## Backend Setup

1. Open Command Prompt as Administrator

2. Navigate to the backend directory:
   ```
   cd path\to\project\backend
   ```

3. Create a virtual environment (recommended):
   ```
   python -m venv venv
   venv\Scripts\activate
   ```

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
   
   If you encounter any issues, you can install each dependency individually:
   ```
   pip install flask==2.2.3
   pip install flask-socketio==5.3.3
   pip install flask-cors==3.0.10
   pip install eventlet==0.33.3
   pip install psutil==5.9.4
   pip install docker==6.1.1
   pip install python-dotenv==1.0.0
   ```

5. Start the backend server:
   ```
   python server.py
   ```

6. The server should now be running at http://localhost:5000

## Frontend Setup

1. Open another Command Prompt window

2. Navigate to the project root directory:
   ```
   cd path\to\project
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Access the application at http://localhost:8080

## Windows-Specific Notes

- **Mini Docker Runtime**: This feature has limited functionality on Windows as it relies on Linux kernel features. The interface will still show the option, but operations will show appropriate messages when Mini Docker features are used.

- **Performance**: For best performance, make sure Docker Desktop has adequate resources allocated in its settings.

- **Firewall**: If you encounter connection issues, check Windows Firewall settings and ensure that Python and Node.js applications are allowed to communicate on your network.

- **WSL Integration**: For advanced users, you can enable WSL 2 integration with Docker Desktop to get improved Linux container support.

## Troubleshooting

1. If the backend fails to start with "No module named 'flask'" or similar errors:
   - Make sure your virtual environment is activated (you should see `(venv)` at the start of your command prompt)
   - Try installing packages individually as shown in step 4 above
   - Verify pip is properly installed with `pip --version`
   - Try upgrading pip: `python -m pip install --upgrade pip`

2. If the frontend fails to connect:
   - Verify the backend server is running
   - Check for any network restrictions
   - Try restarting both servers

3. If Docker operations fail:
   - Check Docker Desktop status
   - Ensure Docker Engine API is enabled in Docker Desktop settings
   - Restart Docker Desktop

For additional help, see the main README.md file or open an issue on the project repository.
