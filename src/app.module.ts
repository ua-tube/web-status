import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.valid('development', 'production', 'test').required(),
        HTTP_HOST: Joi.string().required(),
        HTTP_PORT: Joi.number().required(),
        API_GATEWAY: Joi.string().uri().required(),
        AUTH_SVC_ORIGIN: Joi.string().uri().required(),
        STORAGE_SVC_ORIGIN: Joi.string().uri().required(),
        COMMUNITY_SVC_ORIGIN: Joi.string().uri().required(),
        LIBRARY_SVC_ORIGIN: Joi.string().uri().required(),
        SUBSCRIPTIONS_SVC_ORIGIN: Joi.string().uri().required(),
        USERS_SVC_ORIGIN: Joi.string().uri().required(),
        VIDEO_MANAGER_SVC_ORIGIN: Joi.string().uri().required(),
        VIDEO_STORE_SVC_ORIGIN: Joi.string().uri().required(),
        HISTORY_SVC_ORIGIN: Joi.string().uri().required(),
        SEARCH_SVC_ORIGIN: Joi.string().uri().required(),
      })
    }),
    TerminusModule,
    HttpModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
