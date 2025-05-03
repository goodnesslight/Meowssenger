import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app/app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  });

  console.log('asdasd');
  app.useWebSocketAdapter(new IoAdapter(app));
  await app.listen(3000);
}

bootstrap();
