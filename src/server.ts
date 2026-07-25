import { createServer } from 'node:http';
import createApp from './app.js';
import { appConfig } from './config/index.js';
import { connectDatabase, disconnectDatabase } from './database/index.js';
import { logger } from './utils/logger.js';

const app = createApp();
const server = createServer(app);

let isShuttingDown = false;

const start = async (): Promise<void> => {
  try {
    await connectDatabase();

    server.listen(appConfig.port, () => {
      logger.info(`${appConfig.name} listening on port ${appConfig.port} [${appConfig.env}]`);
      logger.info(`API base: ${appConfig.apiPrefix}`);
      logger.info(`Swagger UI: http://localhost:${appConfig.port}/api-docs`);
    });
  } catch (error) {
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : error,
    });
    process.exit(1);
  }
};

const shutdown = async (signal: string): Promise<void> => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`${signal} received — starting graceful shutdown`);

  server.close(async (closeError) => {
    if (closeError) {
      logger.error(`Error closing HTTP server: ${closeError.message}`);
    }

    try {
      await disconnectDatabase();
      logger.info('Graceful shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', {
        error: error instanceof Error ? error.message : error,
      });
      process.exit(1);
    }
  });

  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 15_000).unref();
};

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack });
  void shutdown('uncaughtException');
});

void start();
