import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Hardcoded demo teacher ID — auth disabled
export const DEMO_TEACHER_ID = "demo-teacher-001";

export { prisma };
