
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { ResourceChart } from '@/components/dashboard/ResourceChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Helper function to generate mock data for development
const generateMockTimeSeriesData = (length = 24, min = 10, max = 70) => {
  const data = [];
  const now = new Date();
  for (let i = length - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 5000);
    data.push({
      timestamp: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      value: Math.floor(Math.random() * (max - min)) + min,
    });
  }
  return data;
};

const Stats = () => {
  // Generate mock data for various metrics
  const cpuData = generateMockTimeSeriesData(24, 10, 70);
  const memoryData = generateMockTimeSeriesData(24, 20, 60);
  const networkInData = generateMockTimeSeriesData(24, 5, 30);
  const networkOutData = generateMockTimeSeriesData(24, 5, 25);
  const diskIOData = generateMockTimeSeriesData(24, 1, 15);
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">System Statistics</h1>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>System Resource Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ResourceChart 
                title="CPU Utilization (%)" 
                data={cpuData} 
                unit="%" 
                maxValue={100}
              />
              
              <ResourceChart 
                title="Memory Usage (%)" 
                data={memoryData} 
                unit="%" 
                maxValue={100}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Network Activity</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ResourceChart 
                title="Network In (MB/s)" 
                data={networkInData} 
                unit=" MB/s" 
                maxValue={50}
                strokeColor="hsl(142, 71%, 45%)"
              />
              
              <ResourceChart 
                title="Network Out (MB/s)" 
                data={networkOutData} 
                unit=" MB/s" 
                maxValue={50}
                strokeColor="hsl(0, 84%, 60%)"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Disk Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResourceChart 
                title="Disk I/O (MB/s)" 
                data={diskIOData} 
                unit=" MB/s" 
                maxValue={20}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Stats;
