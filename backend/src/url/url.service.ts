import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShortenUrlDto } from './dto/shorten-url.dto';
import { UrlInfoDto, AnalyticsDto } from './dto/url-info.dto';
import { PaginatedUrlsDto } from './dto/paginated-urls.dto';
import * as crypto from 'crypto';

@Injectable()
export class UrlService {
  constructor(private prisma: PrismaService) {}

  private generateRandomString(length: number): string {
    const bytes = crypto.randomBytes(Math.ceil(length * 3 / 4));
    return bytes.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
      .slice(0, length);
  }

  async shortenUrl(shortenUrlDto: ShortenUrlDto): Promise<{ shortUrl: string }> {
    const { originalUrl, expiresAt, alias } = shortenUrlDto;
    
    if (alias) {
      const existingUrl = await this.prisma.shortUrl.findUnique({
        where: { alias },
      });
      
      if (existingUrl) {
        throw new Error('Эта ссылка уже занята!');
      }
    }
    
    const shortUrl = alias || this.generateRandomString(8);
    
    await this.prisma.shortUrl.create({
      data: {
        originalUrl,
        shortUrl,
        alias,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });
    
    return { shortUrl };
  }

  async getOriginalUrl(shortUrl: string, ipAddress: string): Promise<string> {
    const url = await this.prisma.shortUrl.findUnique({
      where: { shortUrl },
    });
    
    if (!url) {
      throw new NotFoundException('Ссылка не найдена!');
    }
    
    if (url.expiresAt && new Date() > url.expiresAt) {
      throw new NotFoundException('Ссылка устарела!');
    }
    
    await this.prisma.shortUrl.update({
      where: { id: url.id },
      data: { clickCount: { increment: 1 } },
    });
    
    await this.prisma.analytics.create({
      data: {
        shortUrlId: url.id,
        ipAddress,
      },
    });
    
    return url.originalUrl;
  }

  async getUrlInfo(shortUrl: string): Promise<UrlInfoDto> {
    const url = await this.prisma.shortUrl.findUnique({
      where: { shortUrl },
    });
    
    if (!url) {
      throw new NotFoundException('Ссылка не найдена');
    }
    
    return {
      originalUrl: url.originalUrl,
      createdAt: url.createdAt,
      clickCount: url.clickCount,
      expiresAt: url.expiresAt || undefined,
    };
  }

  async deleteUrl(shortUrl: string): Promise<void> {
    const url = await this.prisma.shortUrl.findUnique({
      where: { shortUrl },
    });
    
    if (!url) {
      throw new NotFoundException('Ссылка не найдена');
    }
    
    await this.prisma.analytics.deleteMany({
      where: { shortUrlId: url.id },
    });
    
    await this.prisma.shortUrl.delete({
      where: { id: url.id },
    });
  }

  async getAnalytics(shortUrl: string): Promise<AnalyticsDto> {
    const url = await this.prisma.shortUrl.findUnique({
      where: { shortUrl },
      include: {
        analytics: {
          orderBy: { visitedAt: 'desc' },
          take: 5,
        },
      },
    });
    
    if (!url) {
      throw new NotFoundException('Ссылка не найдена');
    }
    
    return {
      clickCount: url.clickCount,
      recentVisitors: url.analytics.map(a => ({
        ipAddress: a.ipAddress,
        visitedAt: a.visitedAt,
      })),
    };
  }

  async getAllUrls(page = 1, limit = 10): Promise<PaginatedUrlsDto> {
    page = Math.max(1, page);
    limit = Math.max(1, Math.min(100, limit));
    
    const skip = (page - 1) * limit;
    const total = await this.prisma.shortUrl.count();
    const items = await this.prisma.shortUrl.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    
    return {
      items,
      total,
      page,
      limit,
    };
  }
}