import { NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './modules/app/app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap(): Promise<void> {
  const app: INestApplication = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: '*',
  });
  app.useWebSocketAdapter(new IoAdapter(app));
  await app.listen(Number(process.env.SERVER_PORT));
}

bootstrap();
