import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config();

// Create a test database client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./test.db'
    }
  }
});

// Global test setup
beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
  
  // Clean up test database
  await prisma.booking.deleteMany();
  await prisma.user.deleteMany();
  await prisma.service.deleteMany();
});

// Global test teardown
afterAll(async () => {
  await prisma.$disconnect();
});

// Global test utilities
global.prisma = prisma;

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: () => {},
  error: () => {},
  warn: () => {},
  info: () => {},
}; 