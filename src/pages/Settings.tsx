
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const Settings = () => {
  const [settings, setSettings] = React.useState({
    refreshInterval: '5',
    enableNotifications: true,
    alertThreshold: '80',
    dockerPath: '/usr/bin/docker',
    theme: 'dark',
    enableGpuMonitoring: true
  });
  
  const handleSettingChange = (key: string, value: string | boolean) => {
    setSettings({
      ...settings,
      [key]: value
    });
  };
  
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Settings saved successfully');
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Settings</h1>
        </div>
        
        <form onSubmit={handleSaveSettings}>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure general application settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="refreshInterval">Data Refresh Interval (seconds)</Label>
                    <Input 
                      id="refreshInterval" 
                      type="number" 
                      min="1" 
                      max="60"
                      value={settings.refreshInterval}
                      onChange={(e) => handleSettingChange('refreshInterval', e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="theme">UI Theme</Label>
                    <Select 
                      value={settings.theme} 
                      onValueChange={(value) => handleSettingChange('theme', value)}
                    >
                      <SelectTrigger id="theme">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableNotifications">Enable Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive alerts for container events
                      </p>
                    </div>
                    <Switch 
                      id="enableNotifications"
                      checked={settings.enableNotifications}
                      onCheckedChange={(checked) => handleSettingChange('enableNotifications', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Docker Configuration</CardTitle>
                <CardDescription>
                  Configure Docker connection settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="dockerPath">Docker Binary Path</Label>
                    <Input 
                      id="dockerPath" 
                      value={settings.dockerPath}
                      onChange={(e) => handleSettingChange('dockerPath', e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="alertThreshold">Resource Alert Threshold (%)</Label>
                    <Input 
                      id="alertThreshold" 
                      type="number" 
                      min="50" 
                      max="95"
                      value={settings.alertThreshold}
                      onChange={(e) => handleSettingChange('alertThreshold', e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Alert when CPU or memory usage exceeds this threshold
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableGpuMonitoring">Enable GPU Monitoring</Label>
                      <p className="text-sm text-muted-foreground">
                        Monitor NVIDIA GPU usage (requires nvidia-smi)
                      </p>
                    </div>
                    <Switch 
                      id="enableGpuMonitoring"
                      checked={settings.enableGpuMonitoring}
                      onCheckedChange={(checked) => handleSettingChange('enableGpuMonitoring', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end">
              <Button type="submit">Save Settings</Button>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default Settings;
