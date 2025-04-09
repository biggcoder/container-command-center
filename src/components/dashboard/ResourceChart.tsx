
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { Card as RechartsCard, ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import { cn } from '@/lib/utils';

interface ResourceChartProps {
  title: string;
  data: Array<{ timestamp: string; value: number }>;
  className?: string;
  dataKey?: string;
  strokeColor?: string;
  fillColor?: string;
  unit?: string;
  maxValue?: number;
}

const CustomTooltip = ({ active, payload, label, unit }: TooltipProps<ValueType, NameType> & { unit?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-md p-2 shadow-md">
        <p className="text-sm text-foreground">{`${label}`}</p>
        <p className="text-sm font-medium text-accent">{`${payload[0].value}${unit || ''}`}</p>
      </div>
    );
  }
  return null;
};

export function ResourceChart({
  title,
  data,
  dataKey = 'value',
  strokeColor = 'hsl(var(--accent))',
  fillColor = 'url(#colorGradient)',
  unit = '',
  maxValue = 100,
  className,
}: ResourceChartProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-1 pb-1">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-gradient-top)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--chart-gradient-bottom)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="timestamp" 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
              />
              <YAxis 
                domain={[0, maxValue]} 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
                width={30}
                tickFormatter={(value) => `${value}${unit}`}
              />
              <Tooltip content={<CustomTooltip unit={unit} />} />
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke={strokeColor} 
                strokeWidth={2}
                fillOpacity={1}
                fill={fillColor} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
