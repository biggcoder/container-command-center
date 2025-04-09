
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Link } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

// Mock volume data
const mockVolumes = [
  { 
    id: 'v1', 
    name: 'postgres_data', 
    driver: 'local',
    mountpoint: '/var/lib/docker/volumes/postgres_data/_data',
    size: '1.2 GB',
    created: '3 days ago',
    usedBy: ['postgres-db']
  },
  { 
    id: 'v2', 
    name: 'nginx_config', 
    driver: 'local',
    mountpoint: '/var/lib/docker/volumes/nginx_config/_data',
    size: '24 MB',
    created: '1 week ago',
    usedBy: ['nginx-web']
  },
  { 
    id: 'v3', 
    name: 'redis_data', 
    driver: 'local',
    mountpoint: '/var/lib/docker/volumes/redis_data/_data',
    size: '18 MB',
    created: '2 days ago',
    usedBy: []
  },
  { 
    id: 'v4', 
    name: 'app_uploads', 
    driver: 'local',
    mountpoint: '/var/lib/docker/volumes/app_uploads/_data',
    size: '3.4 GB',
    created: '5 days ago',
    usedBy: ['web-app']
  }
];

const Volumes = () => {
  const [volumes, setVolumes] = React.useState(mockVolumes);
  
  const handleDeleteVolume = (id: string) => {
    const volume = volumes.find(v => v.id === id);
    if (volume && volume.usedBy.length > 0) {
      toast.error(`Cannot delete volume ${volume.name} as it's in use by containers`);
      return;
    }
    setVolumes(volumes.filter(v => v.id !== id));
    toast.success(`Volume deleted successfully`);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Volumes</h1>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Volume
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Docker Volumes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Used By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {volumes.map((volume) => (
                  <TableRow key={volume.id}>
                    <TableCell className="font-medium">{volume.name}</TableCell>
                    <TableCell>{volume.driver}</TableCell>
                    <TableCell>{volume.size}</TableCell>
                    <TableCell>{volume.created}</TableCell>
                    <TableCell>
                      {volume.usedBy.length === 0 ? (
                        <span className="text-muted-foreground">None</span>
                      ) : (
                        <div className="flex gap-2">
                          {volume.usedBy.map((container) => (
                            <Badge key={container} variant="secondary">
                              {container}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="icon" title="Attach">
                          <Link className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="text-destructive hover:text-destructive" 
                          title="Delete"
                          onClick={() => handleDeleteVolume(volume.id)}
                          disabled={volume.usedBy.length > 0}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Volumes;
