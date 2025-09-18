import { join } from 'path';

import fastifyCookie from '@fastify/cookie';
import fastifyMultipart from '@fastify/multipart';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.useStaticAssets({
    root: join(__dirname, '..', 'uploads'),
    prefix: '/uploads/',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const configService = app.get(ConfigService);
  const host = configService.get<string>('HOST');
  const port = configService.get<string>('PORT');
  const secret = configService.get<string>('COOKIE_SECRET');
  const frontend = configService.get<string>('FRONTEND_URL');

  app.enableCors({
    origin: [frontend],
    credentials: true,
    methods: ['GET', 'POST', 'PUT'],
  });

  await app.register(fastifyMultipart);
  await app.register(fastifyCookie, { secret });
  await app.listen(port, host);
}
void bootstrap();
