export class PaginatedUrlsDto {
  items: {
    id: number;
    shortUrl: string;
    originalUrl: string;
    createdAt: Date;
    clickCount: number;
    expiresAt: Date | null;
  }[];
  total: number;
  page: number;
  limit: number;
}

export class GetUrlsQueryDto {
  page?: number;
  limit?: number;
}