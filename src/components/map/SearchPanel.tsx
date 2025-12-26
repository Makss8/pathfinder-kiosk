import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMapStore } from '@/store/mapStore';
import { categoryConfig, MarkerCategory } from '@/types/map';

const SearchPanel: React.FC = () => {
  const { searchQuery, setSearchQuery, activeCategories, toggleCategory, floorPlan } = useMapStore();

  const getCategoryCount = (category: MarkerCategory) => {
    return floorPlan.markers.filter((m) => m.category === category).length;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search stands, facilities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-14 pr-12 h-16 text-xl bg-secondary border-border focus:ring-2 focus:ring-primary rounded-xl"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Category Filters */}
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(categoryConfig) as MarkerCategory[]).map((category) => {
          const config = categoryConfig[category];
          const isActive = activeCategories.includes(category);
          const count = getCategoryCount(category);

          return (
            <Button
              key={category}
              variant="outline"
              onClick={() => toggleCategory(category)}
              className={`
                h-14 flex items-center justify-between px-4 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'border-2 bg-secondary/80' 
                  : 'border-border bg-card opacity-50'
                }
              `}
              style={{
                borderColor: isActive ? config.color : undefined,
                color: isActive ? config.color : undefined,
              }}
            >
              <span className="text-sm font-medium truncate">{config.label}</span>
              <span 
                className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ 
                  backgroundColor: isActive ? `${config.color}33` : 'transparent',
                  color: isActive ? config.color : 'inherit'
                }}
              >
                {count}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default SearchPanel;
