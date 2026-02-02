import { Home, Package, Boxes, BarChart3, User } from 'lucide-react';

interface NavItem {
  icon: typeof Home;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Dashboard', path: '/dealer' },
  { icon: Package, label: 'Orders', path: '/dealer/orders' },
  { icon: Boxes, label: 'Inventory', path: '/dealer/inventory' },
  { icon: BarChart3, label: 'Analytics', path: '/dealer/analytics' },
  { icon: User, label: 'Account', path: '/dealer/account' },
];

interface DealerBottomNavProps {
  activeTab: string;
  onTabChange: (path: string) => void;
}

export function DealerBottomNav({ activeTab, onTabChange }: DealerBottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.path || activeTab.startsWith(item.path + '/');
          return (
            <button
              key={item.path}
              onClick={() => onTabChange(item.path)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
