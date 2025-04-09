
import psutil
import subprocess
import json
import os

class SystemMonitor:
    """Monitor system resources (CPU, Memory, Disk, GPU)"""
    
    def __init__(self):
        self.has_gpu = self._check_gpu_available()
    
    def _check_gpu_available(self):
        """Check if NVIDIA GPU is available"""
        try:
            subprocess.check_output(['nvidia-smi'])
            return True
        except (subprocess.SubprocessError, FileNotFoundError):
            return False
    
    def get_cpu_stats(self):
        """Get CPU usage percentage"""
        return {
            'percent': psutil.cpu_percent(interval=0.1),
            'cores': psutil.cpu_count(),
            'per_core': psutil.cpu_percent(interval=0.1, percpu=True)
        }
    
    def get_memory_stats(self):
        """Get memory usage statistics"""
        mem = psutil.virtual_memory()
        return {
            'total': mem.total // (1024 * 1024),  # MB
            'used': mem.used // (1024 * 1024),    # MB
            'percent': mem.percent
        }
    
    def get_disk_stats(self):
        """Get disk usage statistics"""
        disk = psutil.disk_usage('/')
        return {
            'total': disk.total // (1024 * 1024),  # MB
            'used': disk.used // (1024 * 1024),    # MB
            'percent': disk.percent
        }
    
    def get_gpu_stats(self):
        """Get NVIDIA GPU statistics if available"""
        if not self.has_gpu:
            return {'available': False}
            
        try:
            result = subprocess.check_output(['nvidia-smi', '--query-gpu=utilization.gpu,memory.used,memory.total', '--format=csv,noheader,nounits'])
            utilization, mem_used, mem_total = result.decode('utf-8').strip().split(', ')
            
            return {
                'available': True,
                'percent': float(utilization),
                'memory': {
                    'used': float(mem_used),
                    'total': float(mem_total),
                    'percent': (float(mem_used) / float(mem_total)) * 100 if float(mem_total) > 0 else 0
                }
            }
        except subprocess.SubprocessError:
            return {'available': False}
    
    def get_stats(self):
        """Get all system stats"""
        stats = {
            'cpu': self.get_cpu_stats()['percent'],
            'memory': self.get_memory_stats(),
            'disk': self.get_disk_stats(),
        }
        
        if self.has_gpu:
            gpu_stats = self.get_gpu_stats()
            if gpu_stats['available']:
                stats['gpu'] = gpu_stats['percent']
        
        return stats
