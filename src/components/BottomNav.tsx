import { Home, Grid3X3, Package, User, Wrench } from 'lucide-react';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Grid3X3, label: 'Catalog', path: '/catalog' },
  { icon: Wrench, label: 'Equipment', path: '/equipment' },
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
      <div className="flex items-center justify-around h-14">
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
              <item.icon className={`w-5 h-5 ${isActive ? 'animate-bounce' : ''}`} style={{ animationIterationCount: isActive ? 1 : 0 }} />
              <span className={`text-[10px] mt-0.5 font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
