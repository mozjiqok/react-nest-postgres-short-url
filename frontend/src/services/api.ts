export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface ShortenUrlRequest {
  originalUrl: string;
  expiresAt?: string;
  alias?: string;
}

export interface UrlInfo {
  originalUrl: string;
  createdAt: string;
  clickCount: number;
}

export interface Analytics {
  clickCount: number;
  recentVisitors: {
    ipAddress: string;
    visitedAt: Date;
  }[];
}

export interface PaginatedUrls {
  items: {
    id: number;
    shortUrl: string;
    originalUrl: string;
    createdAt: string;
    clickCount: number;
    expiresAt?: string;
  }[];
  total: number;
  page: number;
  limit: number;
}

export const api = {
  shortenUrl: async (data: ShortenUrlRequest): Promise<{ shortUrl: string }> => {
    const response = await fetch(`${API_BASE_URL}/shorten`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create short URL');
    }

    return response.json();
  },

  getUrlInfo: async (shortUrl: string): Promise<UrlInfo> => {
    const response = await fetch(`${API_BASE_URL}/info/${shortUrl}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get URL info');
    }

    return response.json();
  },

  deleteUrl: async (shortUrl: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/delete/${shortUrl}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete URL');
    }

    return response.json();
  },

  getAnalytics: async (shortUrl: string): Promise<Analytics> => {
    const response = await fetch(`${API_BASE_URL}/analytics/${shortUrl}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get analytics');
    }

    return response.json();
  },

  getAllUrls: async (page = 1, limit = 10): Promise<PaginatedUrls> => {
    const response = await fetch(`${API_BASE_URL}?page=${page}&limit=${limit}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get URLs');
    }

    return response.json();
  },
};