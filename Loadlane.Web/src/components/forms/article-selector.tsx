import { useState, forwardRef, useImperativeHandle } from 'react';
import { Check, ChevronsUpDown, Package, Plus, Scale, Box } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { Badge } from '../ui/badge';
import { useArticles } from '../../hooks/useArticle';
import type { ArticleResponse } from '../../types/article';

interface ArticleSelectorProps {
  value?: string; // Article ID
  onChange: (article: ArticleResponse | null) => void;
  placeholder?: string;
  onCreateNew?: () => void;
}

export interface ArticleSelectorRef {
  refresh: () => void;
}

export const ArticleSelector = forwardRef<ArticleSelectorRef, ArticleSelectorProps>(({
  value,
  onChange,
  placeholder = "Select article...",
  onCreateNew,
}, ref) => {
  const [open, setOpen] = useState(false);

  const { articles, loading, refetch } = useArticles();

  const selectedArticle = articles.find(article => article.id === value);

  // Expose refetch function via ref
  useImperativeHandle(ref, () => ({
    refresh: refetch,
  }));

  const displayValue = selectedArticle
    ? selectedArticle.name
    : placeholder;

  const handleArticleSelect = (article: ArticleResponse) => {
    onChange(article);
    setOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <div className="flex items-center space-x-2 truncate">
              <Package className="h-4 w-4 text-primary" />
              <span className="truncate">{displayValue}</span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search articles..." />
            <CommandList>
              <CommandEmpty>
                {loading ? "Loading articles..." : "No articles found."}
              </CommandEmpty>
              {articles.length > 0 && (
                <CommandGroup heading="Available Articles">
                  {articles.map((article) => (
                    <CommandItem
                      key={article.id}
                      onSelect={() => handleArticleSelect(article)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center space-x-2 flex-1">
                        <Package className="h-4 w-4 text-primary" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{article.name}</div>
                          {article.description && (
                            <div className="text-sm text-muted-foreground truncate">
                              {article.description}
                            </div>
                          )}
                          {(article.weight || article.volume) && (
                            <div className="flex items-center space-x-2 mt-1">
                              {article.weight && (
                                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                  <Scale className="h-3 w-3" />
                                  <span>{article.weight} kg</span>
                                </div>
                              )}
                              {article.volume && (
                                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                  <Box className="h-3 w-3" />
                                  <span>{article.volume} m³</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {selectedArticle?.id === article.id && (
                          <Check className="h-4 w-4" />
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              <CommandGroup>
                {value && (
                  <CommandItem
                    onSelect={handleClear}
                    className="cursor-pointer text-muted-foreground"
                  >
                    <div className="flex items-center space-x-2">
                      <span>Clear selection</span>
                    </div>
                  </CommandItem>
                )}
                {onCreateNew && (
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      onCreateNew();
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Create new article</span>
                    </div>
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
});