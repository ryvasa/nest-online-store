import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/exception-filter';
import { GlobalInterceptor } from './common/interceptors/global.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Online Store API')
    .setDescription('The Online Store API description')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Input your JWT token',
        name: 'Authorization',
        in: 'header',
      },
      'bearer',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      security: [{ bearer: [] }],
    },
  });

  // app.enableCors({
  //   origin: process.env.CONSUME_URL,
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  //   credentials: true,
  // });

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new GlobalInterceptor());

  await app.listen(process.env.PORT || 5000);
}
bootstrap();
