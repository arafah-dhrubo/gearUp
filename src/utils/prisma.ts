import 'dotenv/config';
import { PrismaClient, Prisma } from '../generated/prisma/client.js';
import { PrismaNeon } from '@prisma/adapter-neon';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
export const prisma = new PrismaClient({ adapter });
export { Prisma };