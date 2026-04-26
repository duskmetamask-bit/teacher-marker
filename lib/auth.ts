import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { NeonQueryFunction } from "@neondatabase/serverless";

// Lazy Prisma client — only connects at runtime, not at build time
let _prisma: PrismaClient | undefined;
export function getPrisma(): PrismaClient {
  if (!_prisma) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      // Return a no-op prisma for build time when DATABASE_URL is missing
      return prisma;
    }
    const adapter = new PrismaNeon({ connectionString });
    _prisma = new PrismaClient({ adapter }) as unknown as PrismaClient;
  }
  return _prisma;
}

// Hardcoded demo teacher ID — auth disabled
export const DEMO_TEACHER_ID = "demo-teacher-001";

// Stub prisma for build time — never actually used at runtime since getPrisma() is always called
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    if (prop === "teacher" || prop === "generation") {
      return {
        findUnique: async () => null,
        upsert: async () => ({ id: DEMO_TEACHER_ID }),
        create: async () => ({}),
      };
    }
    return async () => null;
  },
});
