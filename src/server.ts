import app from './app.js';
import { config } from './config/index.js';
import { prisma } from './utils/prisma.js';

const start = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected');
    app.listen(config.port, () => console.log(`Server running on port ${config.port}`));
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
};

start();
