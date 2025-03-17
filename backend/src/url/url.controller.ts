import { Controller, Post, Get, Delete, Body, Param, Req, Res, Query, HttpStatus, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { UrlService } from './url.service';
import { ShortenUrlDto } from './dto/shorten-url.dto';
import { UrlInfoDto, AnalyticsDto } from './dto/url-info.dto';
import { PaginatedUrlsDto, GetUrlsQueryDto } from './dto/paginated-urls.dto';

@Controller()
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('shorten')
  async shortenUrl(@Body() shortenUrlDto: ShortenUrlDto): Promise<{ shortUrl: string }> {
    try {
      return await this.urlService.shortenUrl(shortenUrlDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':shortUrl')
  async redirectToOriginalUrl(
    @Param('shortUrl') shortUrl: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
      const originalUrl = await this.urlService.getOriginalUrl(shortUrl, ipAddress.toString());
      res.redirect(originalUrl);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get('info/:shortUrl')
  async getUrlInfo(@Param('shortUrl') shortUrl: string): Promise<UrlInfoDto> {
    try {
      return await this.urlService.getUrlInfo(shortUrl);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Delete('delete/:shortUrl')
  async deleteUrl(@Param('shortUrl') shortUrl: string): Promise<{ message: string }> {
    try {
      await this.urlService.deleteUrl(shortUrl);
      return { message: 'URL deleted successfully' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get('analytics/:shortUrl')
  async getAnalytics(@Param('shortUrl') shortUrl: string): Promise<AnalyticsDto> {
    try {
      return await this.urlService.getAnalytics(shortUrl);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get()
  async getAllUrls(@Query() query: GetUrlsQueryDto): Promise<PaginatedUrlsDto> {
    try {
      const page = query.page ? parseInt(query.page.toString(), 10) : 1;
      const limit = query.limit ? parseInt(query.limit.toString(), 10) : 10;
      return await this.urlService.getAllUrls(page, limit);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}