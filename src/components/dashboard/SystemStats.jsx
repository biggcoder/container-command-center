
import React from 'react';
import { Cpu, Database, HardDrive, Zap } from 'lucide-react';
import { StatusCard } from './StatusCard';

export function SystemStats({
  cpu,
  memory,
  disk,
  gpu,
  containerCount
}) {
  const memoryUsed = (memory.used / 1024).toFixed(1);
  const memoryTotal = (memory.total / 1024).toFixed(1);
  const diskUsed = (disk.used / 1024).toFixed(1);
  const diskTotal = (disk.total / 1024).toFixed(1);

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <StatusCard 
        title="CPU Usage" 
        value={`${cpu.toFixed(1)}%`} 
        icon={<Cpu />} 
        trend={cpu > 75 ? "up" : cpu < 25 ? "down" : "neutral"}
        trendValue={cpu > 75 ? "+15%" : cpu < 25 ? "-10%" : "±0%"}
      />
      
      <StatusCard 
        title="Memory Usage" 
        value={`${memoryUsed}GB / ${memoryTotal}GB`}
        icon={<Database />} 
        trend="neutral"
        trendValue="±0%"
      />
      
      <StatusCard 
        title="Disk Space" 
        value={`${diskUsed}GB / ${diskTotal}GB`} 
        icon={<HardDrive />} 
      />
      
      {gpu !== undefined ? (
        <StatusCard 
          title="GPU Usage" 
          value={`${gpu.toFixed(1)}%`} 
          icon={<Zap />}
          trend={gpu > 50 ? "up" : "neutral"}
          trendValue={gpu > 50 ? "+25%" : "±0%"}
        />
      ) : (
        <StatusCard 
          title="Containers" 
          value={`${containerCount.running} / ${containerCount.total}`} 
          icon={<HardDrive />} 
        />
      )}
    </div>
  );
}
