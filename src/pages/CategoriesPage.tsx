import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, TrendingUp, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { categories } from '@/data/mockData';
import { BottomNav } from '@/components/BottomNav';

export default function CategoriesPage() {
  const navigate = useNavigate();

  // Group categories by type for Blinkit-style sections
  const categoryGroups = [
    {
      title: 'Engine & Transmission',
      categories: categories.filter(c => 
        ['engine', 'transmission', 'filters'].includes(c.id)
      )
    },
    {
      title: 'Hydraulics & Structure',
      categories: categories.filter(c => 
        ['hydraulics', 'chassis', 'boom'].includes(c.id)
      )
    },
    {
      title: 'Electrical & Others',
      categories: categories.filter(c => 
        !['engine', 'transmission', 'filters', 'hydraulics', 'chassis', 'boom'].includes(c.id)
      )
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background px-4 py-3 border-b">
        <div className="flex items-center gap-3 mb-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Categories</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search for parts..." 
            className="pl-9 bg-muted/50 border-0 rounded-xl h-11"
            onFocus={() => navigate('/')}
          />
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Featured Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'sale', label: '🔥 Sale Today', color: 'bg-red-50 border-red-200 text-red-700' },
            { id: 'trending', label: '📈 Trending', color: 'bg-blue-50 border-blue-200 text-blue-700' },
            { id: 'new', label: '✨ New Arrivals', color: 'bg-purple-50 border-purple-200 text-purple-700' },
          ].map(chip => (
            <button
              key={chip.id}
              onClick={() => navigate(`/categories/${chip.id}`)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all hover:shadow-md ${chip.color}`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Category Groups - Blinkit Style Grid */}
        {categoryGroups.map((group, groupIndex) => (
          <section key={groupIndex} className="animate-fade-in" style={{ animationDelay: `${groupIndex * 100}ms` }}>
            <h2 className="font-semibold text-base mb-3 text-foreground">{group.title}</h2>
            <div className="grid grid-cols-4 gap-3">
              {group.categories.map((category, index) => (
                <div
                  key={category.id}
                  onClick={() => navigate(`/categories/${category.id}`)}
                  className="flex flex-col items-center cursor-pointer group animate-scale-in"
                  style={{ animationDelay: `${(groupIndex * 100) + (index * 50)}ms` }}
                >
                  <div className="w-full aspect-square bg-accent/50 rounded-2xl flex items-center justify-center mb-2 overflow-hidden transition-all group-hover:shadow-lg group-hover:scale-105 group-active:scale-95">
                    {category.image ? (
                      <img 
                        src={category.image} 
                        alt={category.name} 
                        className="w-3/4 h-3/4 object-contain transition-transform group-hover:scale-110"
                      />
                    ) : (
                      <span className="text-3xl">{category.icon}</span>
                    )}
                  </div>
                  <span className="text-xs text-center font-medium text-foreground leading-tight line-clamp-2">
                    {category.name}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* See All Products Link */}
        <div 
          onClick={() => navigate('/categories/all')}
          className="flex items-center justify-center gap-2 py-4 bg-muted/50 rounded-2xl cursor-pointer hover:bg-muted transition-colors"
        >
          <div className="flex -space-x-2">
            {categories.slice(0, 3).map((cat, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-accent border-2 border-background flex items-center justify-center overflow-hidden">
                {cat.image ? (
                  <img src={cat.image} alt="" className="w-6 h-6 object-contain" />
                ) : (
                  <span className="text-sm">{cat.icon}</span>
                )}
              </div>
            ))}
          </div>
          <span className="text-sm font-medium text-foreground">See all products</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      <BottomNav activeTab="/categories" onTabChange={(tab) => navigate(tab)} />
    </div>
  );
}
