
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { ContainerList, Container } from '@/components/dashboard/ContainerList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

// Mock container data for development - in a real app, this would come from an API
const mockContainers: Container[] = [
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
  {
    id: 'c4',
    name: 'mongo-db',
    image: 'mongo:5',
    status: 'exited',
    created: Date.now() - 345600000,
    cpu: 0,
    memory: 0,
    ports: ['27017:27017']
  },
];

const Containers = () => {
  const [containers, setContainers] = React.useState<Container[]>(mockContainers);

  // Mock container actions
  const handleStartContainer = (id: string) => {
    setContainers(prev => prev.map(container => 
      container.id === id ? { ...container, status: 'running', cpu: 1.5, memory: 45 } : container
    ));
    toast.success(`Container ${id} started successfully`);
  };

  const handleStopContainer = (id: string) => {
    setContainers(prev => prev.map(container => 
      container.id === id ? { ...container, status: 'exited', cpu: 0, memory: 0 } : container
    ));
    toast.success(`Container ${id} stopped successfully`);
  };

  const handleDeleteContainer = (id: string) => {
    setContainers(prev => prev.filter(container => container.id !== id));
    toast.success(`Container ${id} removed successfully`);
  };

  const handleViewLogs = (id: string) => {
    toast.info(`Viewing logs for container ${id}`);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Container Management</h1>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Container
          </Button>
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

export default Containers;
