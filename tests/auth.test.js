import request from 'supertest';
import app from '../server.js';
import prisma from '../lib/prisma.js';

export const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'bookingtest@example.com',
  phone: '9876543210',
  password: 'Booking@123',
  birthDate: '1995-01-01'
};

export let token = '';
export let userId = 0;

beforeAll(async () => {
  await prisma.booking.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.user.deleteMany({ where: { email: testUser.email } });
});

afterAll(async () => {
  await prisma.booking.deleteMany({});
  await prisma.user.deleteMany({ where: { email: testUser.email } });
  await prisma.$disconnect();
});

describe('👤 Auth Tests', () => {
  test('Register user', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    token = res.body.token;
    userId = res.body.user.id;
  });

  test('Login user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });
});
