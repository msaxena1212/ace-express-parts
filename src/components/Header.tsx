import { Search, Bell, ShoppingCart, MapPin } from 'lucide-react';
import { Button } from './ui/button';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  onSearchClick: () => void;
}

export function Header({ cartCount, onCartClick, onSearchClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border safe-top">
      {/* Location Bar */}
      <div className="bg-gradient-ace text-primary-foreground px-4 py-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <div className="flex-1">
            <p className="text-body-sm font-medium">Deliver to</p>
            <p className="text-body-sm opacity-90 truncate">Construction Site, Sector 42, Gurugram</p>
          </div>
          <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/10">
            Change
          </Button>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="px-4 py-3 flex items-center gap-3">
        <button 
          onClick={onSearchClick}
          className="flex-1 flex items-center gap-3 bg-muted rounded-lg px-4 py-2.5 text-muted-foreground hover:bg-muted/80 transition-colors"
        >
          <Search className="w-5 h-5" />
          <span className="text-body">Search parts, equipment...</span>
        </button>
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          onClick={onCartClick}
        >
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-pop">
              {cartCount}
            </span>
          )}
        </Button>
      </div>
    </header>
  );
}
