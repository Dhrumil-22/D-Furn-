import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalWithPrisma = global as typeof globalThis & {
  prisma_v5?: PrismaClient;
};

if (!globalWithPrisma.prisma_v5) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  globalWithPrisma.prisma_v5 = new PrismaClient({ adapter });
}

const prisma = globalWithPrisma.prisma_v5;

export default prisma;
