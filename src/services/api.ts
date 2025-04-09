
import { toast } from 'sonner';

// API base URL
const API_BASE = 'http://localhost:5000/api';

// WebSocket connection
let socket: WebSocket | null = null;
const listeners = new Map();
let reconnectTimer: number | null = null;

// Initialize WebSocket connection
export const initializeWebSocket = (onConnect?: () => void) => {
  if (socket) {
    socket.close();
  }

  socket = new WebSocket('ws://localhost:5000/socket.io/?transport=websocket');
  
  socket.onopen = () => {
    console.log('WebSocket connection established');
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (onConnect) onConnect();
  };
  
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      const eventType = data.type;
      
      // Notify subscribers for this event type
      if (listeners.has(eventType)) {
        const callbacks = listeners.get(eventType);
        callbacks.forEach((callback: Function) => callback(data.payload));
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };
  
  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    toast.error('Error connecting to the backend server');
  };
  
  socket.onclose = () => {
    console.log('WebSocket connection closed');
    // Try to reconnect after 5 seconds
    if (!reconnectTimer) {
      reconnectTimer = window.setTimeout(() => {
        initializeWebSocket();
        reconnectTimer = null;
      }, 5000);
    }
  };
  
  return socket;
};

// Subscribe to WebSocket events
export const subscribeToEvent = (eventType: string, callback: Function) => {
  if (!listeners.has(eventType)) {
    listeners.set(eventType, new Set());
  }
  listeners.get(eventType).add(callback);
  
  return () => {
    const callbacks = listeners.get(eventType);
    if (callbacks) {
      callbacks.delete(callback);
    }
  };
};

// Generic API request function
const apiRequest = async (endpoint: string, method = 'GET', body?: any) => {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Handle platform-specific messages
    if (data.message && data.message.includes("not available on")) {
      console.warn(data.message);
      toast.warning(data.message);
    }
    
    return data;
  } catch (error) {
    console.error(`Error in API request to ${endpoint}:`, error);
    toast.error(`API request failed: ${(error as Error).message}`);
    throw error;
  }
};

// Container API functions with runtime support
export const fetchContainers = (runtime = 'docker') => 
  apiRequest(`/containers?runtime=${runtime}`);

export const startContainer = (id: string, runtime = 'docker') => 
  apiRequest(`/containers/${id}/start`, 'POST', { runtime });

export const stopContainer = (id: string, runtime = 'docker') => 
  apiRequest(`/containers/${id}/stop`, 'POST', { runtime });

export const deleteContainer = (id: string, runtime = 'docker') => 
  apiRequest(`/containers/${id}/delete?runtime=${runtime}`, 'DELETE');

export const fetchContainerLogs = (id: string, runtime = 'docker') => 
  apiRequest(`/containers/${id}/logs?runtime=${runtime}`);

export const createContainer = (data: {
  image: string;
  name?: string;
  ports?: Record<string, string>;
  cpu_limit?: number;
  memory_limit?: number;
  gpu?: boolean;
  runtime?: 'docker' | 'mini';
}) => apiRequest('/containers/create', 'POST', data);

// Volume API functions
export const fetchVolumes = () => apiRequest('/volumes');

export const deleteVolume = (id: string) => 
  apiRequest(`/volumes/${id}`, 'DELETE');

// System stats API functions
export const fetchCpuStats = () => apiRequest('/cpu');
export const fetchMemoryStats = () => apiRequest('/memory');
export const fetchDiskStats = () => apiRequest('/disk');
export const fetchGpuStats = () => apiRequest('/gpu');
export const fetchHistory = () => apiRequest('/history');

// Initialize WebSocket on module load
initializeWebSocket();

// Export a function to check if WebSocket is connected
export const isWebSocketConnected = () => socket && socket.readyState === socket.OPEN;
