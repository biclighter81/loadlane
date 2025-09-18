import type {
  ArticleResponse,
  CreateArticleRequest,
  UpdateArticleRequest
} from '../types/article';

const API_BASE_URL = 'http://localhost:5119/api';

class ArticleService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  private async handleDeleteResponse(response: Response): Promise<void> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }
  }

  private async makeApiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    return this.handleResponse<T>(response);
  }

  async getAllArticles(): Promise<ArticleResponse[]> {
    return this.makeApiCall<ArticleResponse[]>('/articles');
  }

  async getArticleById(id: string): Promise<ArticleResponse> {
    return this.makeApiCall<ArticleResponse>(`/articles/${id}`);
  }

  async createArticle(article: CreateArticleRequest): Promise<ArticleResponse> {
    return this.makeApiCall<ArticleResponse>('/articles', {
      method: 'POST',
      body: JSON.stringify(article),
    });
  }

  async updateArticle(id: string, article: UpdateArticleRequest): Promise<ArticleResponse> {
    return this.makeApiCall<ArticleResponse>(`/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(article),
    });
  }

  async deleteArticle(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleDeleteResponse(response);
  }
}

export const articleService = new ArticleService();