import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, TrendingUp, Sparkles, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { categories } from '@/data/mockData';
import { BottomNav } from '@/components/BottomNav';

export default function CategoriesPage() {
  const navigate = useNavigate();

  const featuredCategories = [
    { id: 'sale', name: 'Sale Today', icon: '🔥', color: 'bg-red-100' },
    { id: 'trending', name: 'Trending', icon: '📈', color: 'bg-blue-100' },
    { id: 'new', name: 'New Arrivals', icon: '✨', color: 'bg-purple-100' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background border-b px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Categories</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search categories..." 
            className="pl-9"
            onFocus={() => navigate('/')}
          />
        </div>
      </header>

      <div className="p-4">
        {/* Featured Categories */}
        <div className="mb-6">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Featured
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {featuredCategories.map(cat => (
              <Card 
                key={cat.id}
                className={`p-4 min-w-[100px] text-center cursor-pointer hover:shadow-md transition-shadow ${cat.color}`}
                onClick={() => navigate(`/categories/${cat.id}`)}
              >
                <span className="text-2xl mb-1 block">{cat.icon}</span>
                <span className="text-sm font-medium">{cat.name}</span>
              </Card>
            ))}
          </div>
        </div>

        {/* All Categories Grid */}
        <div>
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            All Categories
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {categories.map(category => (
              <Card 
                key={category.id}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/categories/${category.id}`)}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-2xl mb-3">
                  {category.icon}
                </div>
                <h3 className="font-medium text-sm">{category.name}</h3>
                <p className="text-xs text-muted-foreground">({category.productCount}+ parts)</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <BottomNav activeTab="/categories" onTabChange={(tab) => navigate(tab)} />
    </div>
  );
}
