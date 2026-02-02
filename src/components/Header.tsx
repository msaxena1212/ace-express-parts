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
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border safe-top shadow-sm">
      {/* Top Bar with Logo */}
      <div className="px-4 py-2.5 flex items-center justify-between bg-gradient-to-r from-background to-primary/5">
        <div className="flex items-center gap-2">
          <div className="relative">
            <img src={aceLogo} alt="ACE" className="h-9 w-auto" />
          </div>
          <div className="flex flex-col">
            <span className="text-primary font-bold text-sm leading-tight">GENUINE PARTS</span>
            <span className="text-[9px] text-muted-foreground">Swift • Secure • Reliable</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" className="relative hover:bg-primary/10">
            <Bell className="w-5 h-5 text-foreground" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              3
            </span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon-sm" 
            className="relative hover:bg-primary/10"
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
      <div className="px-4 py-2 flex items-center gap-2 bg-card/50 border-b border-border/50">
        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
          <MapPin className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-muted-foreground">Deliver to</p>
          <p className="text-xs font-medium text-foreground truncate">Construction Site, Sector 42, Gurugram</p>
        </div>
        <Button variant="ghost" size="sm" className="text-primary text-xs h-7 hover:bg-primary/10">
          Change
        </Button>
      </div>
      
      {/* Search Bar */}
      <div className="px-4 py-2.5 bg-background">
        <button 
          onClick={onSearchClick}
          className="w-full flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-2.5 text-muted-foreground hover:border-primary/50 hover:shadow-sm transition-all"
        >
          <Search className="w-4 h-4 text-primary" />
          <span className="text-sm">Search genuine ACE parts...</span>
        </button>
      </div>
    </header>
  );
}
