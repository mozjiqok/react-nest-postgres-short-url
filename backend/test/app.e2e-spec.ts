import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('URL Shortener (e2e)', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await prismaService.shortUrl.deleteMany();
  });

  it('should create a shortened URL', async () => {
    const originalUrl = 'https://example.com';
    const response = await request(app.getHttpServer())
      .post('/shorten')
      .send({ originalUrl })
      .expect(201);

    expect(response.body).toHaveProperty('shortUrl');
    const shortUrl = response.body.shortUrl;

    const savedUrl = await prismaService.shortUrl.findFirst({
      where: { shortUrl }
    });
    expect(savedUrl).toBeDefined();
    expect(savedUrl?.originalUrl).toBe(originalUrl);
  });

  it('should forward to original URL', async () => {
    const originalUrl = 'https://example.com';
    const createResponse = await request(app.getHttpServer())
      .post('/shorten')
      .send({ originalUrl });

    const shortUrlCode = createResponse.body.shortUrl;

    return request(app.getHttpServer())
      .get(`/${shortUrlCode}`)
      .expect(302)
      .expect('Location', originalUrl);
  });
});
