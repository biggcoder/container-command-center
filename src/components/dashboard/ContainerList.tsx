
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Square, FileText, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Container interface
export interface Container {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'exited' | 'created' | 'paused';
  created: number;
  cpu: number;
  memory: number;
  ports: string[];
}

interface ContainerListProps {
  containers: Container[];
  onStart?: (id: string) => void;
  onStop?: (id: string) => void;
  onDelete?: (id: string) => void;
  onViewLogs?: (id: string) => void;
  className?: string;
}

export function ContainerList({
  containers,
  onStart,
  onStop,
  onDelete,
  onViewLogs,
  className,
}: ContainerListProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-lg">Containers</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Name</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[120px]">CPU</TableHead>
              <TableHead className="w-[120px]">Memory</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {containers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No containers found
                </TableCell>
              </TableRow>
            ) : (
              containers.map((container) => (
                <TableRow key={container.id} className="group">
                  <TableCell className="font-medium">{container.name}</TableCell>
                  <TableCell className="text-muted-foreground">{container.image}</TableCell>
                  <TableCell>
                    <StatusBadge status={container.status} />
                  </TableCell>
                  <TableCell>{`${container.cpu.toFixed(1)}%`}</TableCell>
                  <TableCell>{`${container.memory.toFixed(1)}MB`}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {container.status === 'running' ? (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onStop?.(container.id)}
                          title="Stop"
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onStart?.(container.id)}
                          title="Start"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onViewLogs?.(container.id)}
                        title="View Logs"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onDelete?.(container.id)}
                        className="text-destructive hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: Container['status'] }) {
  if (status === 'running') {
    return (
      <Badge variant="default" className="bg-success text-success-foreground">
        <span className="mr-1 h-2 w-2 rounded-full bg-current animate-pulse-opacity" />
        Running
      </Badge>
    );
  }
  if (status === 'exited') {
    return (
      <Badge variant="secondary" className="text-muted-foreground">
        Exited
      </Badge>
    );
  }
  if (status === 'paused') {
    return (
      <Badge variant="outline" className="text-yellow-400 border-yellow-400">
        Paused
      </Badge>
    );
  }
  return (
    <Badge variant="outline">Created</Badge>
  );
}
