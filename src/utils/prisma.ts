import 'dotenv/config';
import pg from 'pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const url = new URL(process.env.DATABASE_URL!);
const ssl = url.searchParams.get('sslmode') === 'require' ? { rejectUnauthorized: false } : undefined;
const pool = new pg.Pool({
  host: url.hostname,
  port: parseInt(url.port || '5432'),
  database: url.pathname.slice(1).split('?')[0],
  user: url.username,
  password: url.password,
  ssl,
  max: 5,
});
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });
