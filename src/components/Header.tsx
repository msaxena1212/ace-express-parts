import { Search, Bell, ShoppingCart, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import aceLogo from '@/assets/ace-logo.png';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  onSearchClick: () => void;
}

export function Header({ cartCount, onCartClick, onSearchClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border safe-top">
      {/* Top Bar with Logo */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <img src={aceLogo} alt="ACE" className="h-8 w-auto" />
          <span className="text-primary font-bold text-sm">GENUINE PARTS</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" className="relative">
            <Bell className="w-5 h-5 text-foreground" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              3
            </span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon-sm" 
            className="relative"
            onClick={onCartClick}
          >
            <ShoppingCart className="w-5 h-5 text-foreground" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-pop">
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </div>
      
      {/* Location Bar */}
      <div className="px-4 py-2 flex items-center gap-2 bg-card">
        <MapPin className="w-4 h-4 text-primary" />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-muted-foreground">Deliver to</p>
          <p className="text-xs font-medium text-foreground truncate">Construction Site, Sector 42, Gurugram</p>
        </div>
        <Button variant="ghost" size="sm" className="text-primary text-xs h-7">
          Change
        </Button>
      </div>
      
      {/* Search Bar */}
      <div className="px-4 py-3 bg-background">
        <button 
          onClick={onSearchClick}
          className="w-full flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 text-muted-foreground hover:border-primary/50 transition-colors"
        >
          <Search className="w-5 h-5 text-primary" />
          <span className="text-sm">Search genuine ACE parts...</span>
        </button>
      </div>
    </header>
  );
}
