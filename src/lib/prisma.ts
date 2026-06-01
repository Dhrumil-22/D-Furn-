import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalWithPrisma = global as typeof globalThis & {
  prisma?: PrismaClient;
};

if (!globalWithPrisma.prisma) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  globalWithPrisma.prisma = new PrismaClient({ adapter });
}

const prisma = globalWithPrisma.prisma;

export default prisma;
