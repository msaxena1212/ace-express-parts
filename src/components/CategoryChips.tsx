import { Category } from '@/data/mockData';

interface CategoryChipsProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function CategoryChips({ categories, selectedCategory, onSelectCategory }: CategoryChipsProps) {
  return (
    <section className="px-4 py-3">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => onSelectCategory(null)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
            selectedCategory === null
              ? 'bg-primary text-primary-foreground border-primary glow-orange-sm'
              : 'bg-card text-foreground border-border hover:border-primary/50'
          }`}
        >
          All Parts
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              selectedCategory === category.id
                ? 'bg-primary text-primary-foreground border-primary glow-orange-sm'
                : 'bg-card text-foreground border-border hover:border-primary/50'
            }`}
          >
            <span>{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
