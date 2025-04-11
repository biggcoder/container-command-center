
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

const mockContainers = [
  { id: 'c1', name: 'nginx-web' },
  { id: 'c2', name: 'postgres-db' },
  { id: 'c3', name: 'redis-cache' },
];

// Generate mock logs for development
const generateMockLogs = (containerName, count = 50) => {
  const logTypes = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
  const logMessages = [
    'Container started',
    'Processing request',
    'Connection established',
    'Data received',
    'Operation completed',
    'Resource allocated',
    'Cache miss',
    'Authentication successful',
    'Failed to connect to database',
    'Permission denied',
  ];
  
  const logs = [];
  
  for (let i = 0; i < count; i++) {
    const type = logTypes[Math.floor(Math.random() * logTypes.length)];
    const message = logMessages[Math.floor(Math.random() * logMessages.length)];
    const timestamp = new Date(Date.now() - (count - i) * 10000).toISOString();
    
    logs.push({
      timestamp,
      type,
      message: `[${containerName}] ${message}`,
    });
  }
  
  return logs;
};

const Logs = () => {
  const [selectedContainer, setSelectedContainer] = useState(mockContainers[0].id);
  const [logs, setLogs] = useState(() => 
    generateMockLogs(mockContainers[0].name)
  );
  
  // Update logs when container selection changes
  const handleContainerChange = (value) => {
    setSelectedContainer(value);
    const container = mockContainers.find(c => c.id === value);
    if (container) {
      setLogs(generateMockLogs(container.name));
    }
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Container Logs</h1>
          <div className="w-[200px]">
            <Select value={selectedContainer} onValueChange={handleContainerChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select container" />
              </SelectTrigger>
              <SelectContent>
                {mockContainers.map(container => (
                  <SelectItem key={container.id} value={container.id}>
                    {container.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {mockContainers.find(c => c.id === selectedContainer)?.name} Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] rounded border border-border bg-card p-4">
              <pre className="font-mono text-xs">
                {logs.map((log, index) => (
                  <div 
                    key={index} 
                    className={`py-1 border-b border-border/30 last:border-0 ${
                      log.type === 'ERROR' ? 'text-destructive' : 
                      log.type === 'WARN' ? 'text-yellow-400' : 
                      log.type === 'INFO' ? 'text-accent' :
                      'text-muted-foreground'
                    }`}
                  >
                    <span className="text-muted-foreground mr-2">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="font-semibold mr-2">[{log.type}]</span>
                    <span>{log.message}</span>
                  </div>
                ))}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Logs;
