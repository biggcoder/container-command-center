
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { SystemStats } from '@/components/dashboard/SystemStats';
import { ResourceChart } from '@/components/dashboard/ResourceChart';
import { ContainerList } from '@/components/dashboard/ContainerList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

// Helper function to generate mock data for development
const generateMockTimeSeriesData = (length = 24) => {
  const data = [];
  const now = new Date();
  for (let i = length - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 5000);
    data.push({
      timestamp: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      value: Math.floor(Math.random() * 60) + 10, // Random value between 10-70
    });
  }
  return data;
};

// Mock container data for development
const mockContainers = [
  {
    id: 'c1',
    name: 'nginx-web',
    image: 'nginx:latest',
    status: 'running',
    created: Date.now() - 86400000,
    cpu: 2.4,
    memory: 64.5,
    ports: ['80:80']
  },
  {
    id: 'c2',
    name: 'postgres-db',
    image: 'postgres:14',
    status: 'running',
    created: Date.now() - 172800000,
    cpu: 5.7,
    memory: 256.8,
    ports: ['5432:5432']
  },
  {
    id: 'c3',
    name: 'redis-cache',
    image: 'redis:alpine',
    status: 'exited',
    created: Date.now() - 259200000,
    cpu: 0,
    memory: 0,
    ports: ['6379:6379']
  },
];

const Dashboard = () => {
  const [cpuData, setCpuData] = useState(generateMockTimeSeriesData());
  const [memoryData, setMemoryData] = useState(generateMockTimeSeriesData());
  const [diskData, setDiskData] = useState(generateMockTimeSeriesData());
  const [containers, setContainers] = useState(mockContainers);

  // Mock data update effect - would be replaced with real WebSocket connection
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuData(prev => {
        const newData = [...prev.slice(1), {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          value: Math.floor(Math.random() * 60) + 10,
        }];
        return newData;
      });
      
      setMemoryData(prev => {
        const newData = [...prev.slice(1), {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          value: Math.floor(Math.random() * 40) + 20,
        }];
        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Mock container actions
  const handleStartContainer = (id) => {
    setContainers(prev => prev.map(container => 
      container.id === id ? { ...container, status: 'running', cpu: 1.5, memory: 45 } : container
    ));
    toast.success(`Container ${id} started successfully`);
  };

  const handleStopContainer = (id) => {
    setContainers(prev => prev.map(container => 
      container.id === id ? { ...container, status: 'exited', cpu: 0, memory: 0 } : container
    ));
    toast.success(`Container ${id} stopped successfully`);
  };

  const handleDeleteContainer = (id) => {
    setContainers(prev => prev.filter(container => container.id !== id));
    toast.success(`Container ${id} removed successfully`);
  };

  const handleViewLogs = (id) => {
    toast.info(`Viewing logs for container ${id}`);
  };

  // Calculate system stats
  const cpuUsage = cpuData[cpuData.length - 1]?.value || 0;
  const memoryStats = {
    used: 4596, // mock values in MB
    total: 16384
  };
  const diskStats = {
    used: 156000, // mock values in MB
    total: 512000
  };
  const containerCount = {
    running: containers.filter(c => c.status === 'running').length,
    total: containers.length
  };

  return (
    <MainLayout>
      <div className="grid grid-cols-1 gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">System Dashboard</h1>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Container
          </Button>
        </div>

        <SystemStats
          cpu={cpuUsage}
          memory={memoryStats}
          disk={diskStats}
          containerCount={containerCount}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResourceChart 
            title="CPU Utilization" 
            data={cpuData} 
            unit="%" 
          />
          <ResourceChart 
            title="Memory Usage" 
            data={memoryData} 
            unit="%" 
            maxValue={100}
          />
        </div>

        <ContainerList 
          containers={containers}
          onStart={handleStartContainer}
          onStop={handleStopContainer}
          onDelete={handleDeleteContainer}
          onViewLogs={handleViewLogs}
        />
      </div>
    </MainLayout>
  );
};

export default Dashboard;
