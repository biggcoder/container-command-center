
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Boxes, 
  BarChart3, 
  Settings, 
  Terminal, 
  Database 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Containers', icon: Boxes, path: '/containers' },
  { name: 'Stats', icon: BarChart3, path: '/stats' },
  { name: 'Logs', icon: Terminal, path: '/logs' },
  { name: 'Volumes', icon: Database, path: '/volumes' },
  { name: 'Settings', icon: Settings, path: '/settings' }
];

export const Sidebar = () => {
  return (
    <div className="w-16 md:w-64 bg-sidebar shrink-0 border-r border-sidebar-border flex flex-col">
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        <span className="hidden md:block font-semibold text-lg text-white">ContainerOS</span>
        <span className="md:hidden font-bold text-xl text-accent">C</span>
      </div>
      <nav className="flex-1 py-6">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <TooltipProvider key={item.name} delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <li>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          isActive
                            ? "bg-sidebar-accent text-accent font-medium"
                            : "text-sidebar-foreground"
                        )
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="hidden md:block">{item.name}</span>
                    </NavLink>
                  </li>
                </TooltipTrigger>
                <TooltipContent side="right" className="md:hidden">
                  {item.name}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </ul>
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <div className="hidden md:block text-xs text-muted-foreground">
          <p>ContainerOS v0.1.0</p>
        </div>
      </div>
    </div>
  );
};
