import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as functions from 'firebase-functions';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

// Suas funções de configuração permanecem as mesmas
function configureSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('UniFood API')
    .setDescription('Documentação da API do UniFood')
    .setVersion('1.0')
    .addTag('unifood')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // O Swagger ficará em /api/api
  SwaggerModule.setup('api', app, document);
}

function configureValidationPipe(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}

// Lógica para o Firebase Functions
const expressServer = express();

const createNestServer = async (expressInstance) => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );

  // A ordem aqui é importante
  app.setGlobalPrefix('api');
  configureSwagger(app);
  configureValidationPipe(app);

  return app.init();
};

createNestServer(expressServer)
  .then(() => console.log('Nest Ready'))
  .catch((err) => console.error('Nest broken', err));

// Exporta a função com o nome "api" para o Firebase
export const api = functions.https.onRequest(expressServer);
