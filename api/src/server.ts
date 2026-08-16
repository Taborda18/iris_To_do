import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './infrastructure/prisma.js';

const app = createApp();

const startServer = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('MongoDB connection established');
    app.listen(env.PORT, () => console.log(`API listening on port ${env.PORT}`));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown database connection error';
    console.error(`MongoDB connection failed: ${message}`);
    process.exitCode = 1;
  }
};

void startServer();
