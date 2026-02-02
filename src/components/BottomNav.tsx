import { Home, Grid3X3, Package, User, Wrench } from 'lucide-react';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Grid3X3, label: 'Categories', path: '/categories' },
  { icon: Wrench, label: 'Machines', path: '/machines' },
  { icon: Package, label: 'Orders', path: '/orders' },
  { icon: User, label: 'Account', path: '/account' },
];

interface BottomNavProps {
  activeTab: string;
  onTabChange: (path: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = activeTab === item.path;
          return (
            <button
              key={item.path}
              onClick={() => onTabChange(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-orange-subtle' : ''}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-primary' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
