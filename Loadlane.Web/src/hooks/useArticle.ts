import { useState, useEffect } from 'react';
import { articleService } from '../services/articleService';
import type { CreateArticleRequest, UpdateArticleRequest, ArticleResponse } from '../types/article';

export function useArticles() {
  const [articles, setArticles] = useState<ArticleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await articleService.getAllArticles();
      setArticles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const createArticle = async (articleData: CreateArticleRequest): Promise<ArticleResponse> => {
    try {
      setError(null);
      const newArticle = await articleService.createArticle(articleData);
      setArticles(prev => [newArticle, ...prev]);
      return newArticle;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create article';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateArticle = async (id: string, articleData: UpdateArticleRequest): Promise<void> => {
    try {
      setError(null);
      const updatedArticle = await articleService.updateArticle(id, articleData);
      setArticles(prev => prev.map(article =>
        article.id === id ? updatedArticle : article
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update article';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteArticle = async (id: string): Promise<void> => {
    try {
      setError(null);
      await articleService.deleteArticle(id);
      setArticles(prev => prev.filter(article => article.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete article';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getArticleById = async (id: string): Promise<ArticleResponse | null> => {
    try {
      setError(null);
      return await articleService.getArticleById(id);
    } catch (err) {
      if (err instanceof Error && err.message.includes('404')) {
        return null;
      }
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error fetching article:', err);
      return null;
    }
  };

  const refetch = () => {
    fetchArticles();
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  return {
    articles,
    loading,
    error,
    refetch,
    createArticle,
    updateArticle,
    deleteArticle,
    getArticleById,
  };
}

export function useArticle(id: string) {
  const [article, setArticle] = useState<ArticleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await articleService.getArticleById(id);
      setArticle(data);
    } catch (err) {
      if (err instanceof Error && err.message.includes('404')) {
        setArticle(null);
      } else {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        console.error('Error fetching article:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchArticle();
  };

  useEffect(() => {
    if (id) {
      fetchArticle();
    }
  }, [id]);

  return {
    article,
    loading,
    error,
    refetch,
  };
}