import { useNavigate } from 'react-router-dom';
import { Wrench, Calendar, Gift, BarChart3, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface QuickAccessItem {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
  path: string;
  bgColor: string;
  iconColor: string;
}

const quickAccessItems: QuickAccessItem[] = [
  {
    id: 'maintenance',
    icon: Calendar,
    label: 'Maintenance',
    description: 'Track & schedule service',
    path: '/maintenance',
    bgColor: 'bg-blue-100 dark:bg-blue-950/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'service',
    icon: Wrench,
    label: 'Service Request',
    description: 'Report an issue',
    path: '/service/new',
    bgColor: 'bg-orange-100 dark:bg-orange-950/30',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  {
    id: 'loyalty',
    icon: Gift,
    label: 'Rewards',
    description: 'View your points',
    path: '/loyalty',
    bgColor: 'bg-purple-100 dark:bg-purple-950/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    id: 'analytics',
    icon: BarChart3,
    label: 'Analytics',
    description: 'Fleet performance',
    path: '/analytics',
    bgColor: 'bg-green-100 dark:bg-green-950/30',
    iconColor: 'text-green-600 dark:text-green-400',
  },
];

export function QuickAccessCards() {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-4">
      <h3 className="text-sm font-semibold text-muted-foreground mb-3">Quick Access</h3>
      <div className="grid grid-cols-2 gap-3">
        {quickAccessItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.id}
              className="p-4 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
              onClick={() => navigate(item.path)}
            >
              <div className={`w-10 h-10 rounded-xl ${item.bgColor} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${item.iconColor}`} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
