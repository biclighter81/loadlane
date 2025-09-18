import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Loader2 } from 'lucide-react';
import type { CreateArticleRequest, UpdateArticleRequest, ArticleResponse } from '../../types/article';

type ArticleFormData = {
  name: string;
  description?: string;
  weight?: number;
  volume?: number;
};

interface ArticleFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateArticleRequest | UpdateArticleRequest) => Promise<void>;
  article?: ArticleResponse; // For editing existing articles
  mode: 'create' | 'edit';
}

export function ArticleFormDialog({ open, onClose, onSubmit, article, mode }: ArticleFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ArticleFormData>({
    defaultValues: {
      name: article?.name || '',
      description: article?.description || '',
      weight: article?.weight || undefined,
      volume: article?.volume || undefined,
    },
  });

  // Reset form when article prop changes or dialog opens
  useEffect(() => {
    if (open) {
      if (article && mode === 'edit') {
        form.reset({
          name: article.name,
          description: article.description || '',
          weight: article.weight || undefined,
          volume: article.volume || undefined,
        });
      } else {
        form.reset({
          name: '',
          description: '',
          weight: undefined,
          volume: undefined,
        });
      }
    }
  }, [open, article, mode, form]);

  const handleSubmit = async (data: ArticleFormData) => {
    if (!data.name || data.name.trim().length < 2) {
      return;
    }

    try {
      setIsSubmitting(true);
      const submitData: CreateArticleRequest | UpdateArticleRequest = {
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        weight: data.weight || undefined,
        volume: data.volume || undefined,
      };

      await onSubmit(submitData);
      form.reset();
      onClose();
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} article:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Article' : 'Edit Article'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new article to your catalog.'
              : 'Update the article information.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Article Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Electronics, Furniture, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional details about the article..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="25.5"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="volume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volume (m³)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="1.5"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'create' ? 'Create Article' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}