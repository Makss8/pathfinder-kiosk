import React from 'react';
import { ArrowLeft, Map, Settings, Layers, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();

  const tabs = [
    { id: 'markers', label: 'Markers', icon: Map },
    { id: 'floor-plan', label: 'Floor Plan', icon: Layers },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-72 bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Map
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => onTabChange(tab.id)}
              className={`
                w-full h-14 justify-start px-4 rounded-xl transition-all
                ${isActive 
                  ? 'bg-primary/10 text-primary border border-primary/30' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }
              `}
            >
              <Icon className="h-5 w-5 mr-3" />
              <span className="font-medium">{tab.label}</span>
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-center text-sm text-muted-foreground">
          <p>Event Navigator Admin</p>
          <p className="text-xs mt-1">v1.0.0</p>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
