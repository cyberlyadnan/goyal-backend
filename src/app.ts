import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { appConfig, swaggerSpec, isDevelopment } from './config/index.js';
import {
  rateLimiter,
  sanitizeNoSql,
  sanitizeXss,
  notFoundHandler,
  globalErrorHandler,
  responseFormatter,
} from './middleware/index.js';
import { initCloudinary } from './services/cloudinary.service.js';
import { initFirebase } from './services/firebase.service.js';
import { getRazorpayClient } from './services/razorpay.service.js';
import routes from './routes/index.js';
import { logger } from './utils/logger.js';

const createApp = (): express.Application => {
  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: appConfig.corsOrigin === '*' ? true : appConfig.corsOrigin.split(','),
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: appConfig.requestBodyLimit }));
  app.use(express.urlencoded({ extended: true, limit: appConfig.requestBodyLimit }));
  app.use(sanitizeNoSql);
  app.use(sanitizeXss);
  app.use(rateLimiter);
  app.use(responseFormatter);

  if (isDevelopment) {
    app.use(morgan('dev'));
  } else {
    app.use(
      morgan('combined', {
        stream: {
          write: (message: string) => logger.info(message.trim()),
        },
      }),
    );
  }

  initCloudinary();
  initFirebase();
  getRazorpayClient();

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
  app.get('/api-docs.json', (_req, res) => {
    res.json(swaggerSpec);
  });

  app.use(appConfig.apiPrefix, routes);

  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
};

export default createApp;
