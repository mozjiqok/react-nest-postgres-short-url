export class UrlInfoDto {
  originalUrl: string;
  createdAt: Date;
  clickCount: number;
  expiresAt?: Date;
}

export class AnalyticsDto {
  clickCount: number;
  recentVisitors: {
    ipAddress: string;
    visitedAt: Date;
  }[];
}