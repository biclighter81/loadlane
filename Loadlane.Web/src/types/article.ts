export interface Article {
  name: string;
  description?: string;
  weight?: number;
  volume?: number;
}

export interface CreateArticleRequest {
  name: string;
  description?: string;
  weight?: number;
  volume?: number;
}

export interface UpdateArticleRequest {
  name: string;
  description?: string;
  weight?: number;
  volume?: number;
}

export interface ArticleResponse {
  id: string;
  name: string;
  description?: string;
  weight?: number;
  volume?: number;
  createdUtc: string;
}