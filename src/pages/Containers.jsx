
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { ContainerList } from '@/components/dashboard/ContainerList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchContainers, startContainer, stopContainer, deleteContainer } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import CreateContainerDialog from '@/components/containers/CreateContainerDialog';

const Containers = () => {
  const [activeRuntime, setActiveRuntime] = useState('docker');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Query containers based on active runtime
  const { data: containers = [], refetch } = useQuery({
    queryKey: ['containers', activeRuntime],
    queryFn: () => fetchContainers(activeRuntime),
    refetchInterval: 5000
  });

  // Handle container actions
  const handleStartContainer = async (id) => {
    try {
      await startContainer(id, activeRuntime);
      toast.success(`Container ${id} started successfully`);
      refetch();
    } catch (error) {
      console.error('Failed to start container:', error);
      toast.error('Failed to start container');
    }
  };

  const handleStopContainer = async (id) => {
    try {
      await stopContainer(id, activeRuntime);
      toast.success(`Container ${id} stopped successfully`);
      refetch();
    } catch (error) {
      console.error('Failed to stop container:', error);
      toast.error('Failed to stop container');
    }
  };

  const handleDeleteContainer = async (id) => {
    try {
      await deleteContainer(id, activeRuntime);
      toast.success(`Container ${id} removed successfully`);
      refetch();
    } catch (error) {
      console.error('Failed to delete container:', error);
      toast.error('Failed to delete container');
    }
  };

  const handleViewLogs = (id) => {
    toast.info(`Viewing logs for container ${id}`);
    // In a real app, navigate to logs page or show logs modal
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Container Management</h1>
          <Button 
            className="flex items-center gap-2"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            New Container
          </Button>
        </div>
        
        <Tabs
          defaultValue="docker"
          value={activeRuntime}
          onValueChange={(value) => setActiveRuntime(value)}
          className="w-full"
        >
          <TabsList className="grid w-[400px] grid-cols-2">
            <TabsTrigger value="docker">Docker Engine</TabsTrigger>
            <TabsTrigger value="mini">Mini Docker</TabsTrigger>
          </TabsList>
          
          <TabsContent value="docker" className="mt-4">
            <ContainerList 
              containers={containers}
              onStart={handleStartContainer}
              onStop={handleStopContainer}
              onDelete={handleDeleteContainer}
              onViewLogs={handleViewLogs}
            />
          </TabsContent>
          
          <TabsContent value="mini" className="mt-4">
            <ContainerList 
              containers={containers}
              onStart={handleStartContainer}
              onStop={handleStopContainer}
              onDelete={handleDeleteContainer}
              onViewLogs={handleViewLogs}
            />
          </TabsContent>
        </Tabs>
      </div>

      <CreateContainerDialog 
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        runtime={activeRuntime}
        onSuccess={() => {
          setIsCreateDialogOpen(false);
          refetch();
        }}
      />
    </MainLayout>
  );
};

export default Containers;
