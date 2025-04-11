
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { createContainer } from '@/services/api';

const CreateContainerDialog = ({ 
  open, 
  onClose,
  runtime,
  onSuccess 
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      name: '',
      image: runtime === 'mini' ? 'busybox' : 'nginx:latest',
      cpu_limit: undefined,
      memory_limit: undefined,
      port: '',
      useGpu: false
    }
  });

  const onSubmit = async (data) => {
    try {
      // Parse ports from string to object
      const ports = {};
      if (data.port && data.port.includes(':')) {
        const [hostPort, containerPort] = data.port.split(':');
        ports[containerPort] = hostPort;
      }

      await createContainer({
        name: data.name,
        image: data.image,
        cpu_limit: data.cpu_limit,
        memory_limit: data.memory_limit,
        ports,
        gpu: data.useGpu,
        runtime
      });

      toast.success('Container created successfully');
      reset();
      onSuccess();
    } catch (error) {
      toast.error(`Failed to create container: ${error.message}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New {runtime === 'mini' ? 'Mini Docker' : 'Docker'} Container</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Container Name</Label>
              <Input
                id="name"
                placeholder="my-container"
                {...register('name')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <Input
                id="image"
                placeholder={runtime === 'mini' ? 'busybox' : 'nginx:latest'}
                {...register('image', { required: 'Image is required' })}
              />
              {errors.image && (
                <p className="text-sm text-destructive">{errors.image.message}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpu_limit">CPU Limit (cores)</Label>
              <Input
                id="cpu_limit"
                type="number"
                step="0.1"
                min="0.1"
                placeholder="1"
                {...register('cpu_limit', { 
                  valueAsNumber: true,
                  min: { value: 0.1, message: 'Min CPU is 0.1' } 
                })}
              />
              {errors.cpu_limit && (
                <p className="text-sm text-destructive">{errors.cpu_limit.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="memory_limit">Memory Limit (MB)</Label>
              <Input
                id="memory_limit"
                type="number"
                step="32"
                min="32"
                placeholder="512"
                {...register('memory_limit', { 
                  valueAsNumber: true,
                  min: { value: 32, message: 'Min memory is 32MB' } 
                })}
              />
              {errors.memory_limit && (
                <p className="text-sm text-destructive">{errors.memory_limit.message}</p>
              )}
            </div>
          </div>
          
          {runtime === 'docker' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="port">Port Mapping (host:container)</Label>
                <Input
                  id="port"
                  placeholder="8080:80"
                  {...register('port')}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="use_gpu" {...register('useGpu')} />
                <Label htmlFor="use_gpu">Use GPU (if available)</Label>
              </div>
            </>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Container'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateContainerDialog;
