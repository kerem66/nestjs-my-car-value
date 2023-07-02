import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
const cookieSession = require('cookie-session');
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    cookieSession({
      keys: ['kerem'],
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // this property removes the additional keys that are not exists in our DTO
    }),
  );
  await app.listen(3000);
}
bootstrap();
