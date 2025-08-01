import request from 'supertest';
import app from '../server.js';
import prisma from '../lib/prisma.js';
import { testUser, token, userId } from './auth.test.js';

let serviceId = 0;
let bookingId = 0;

const testService = {
  title: 'Test Massage',
  description: 'Relax your soul',
  price: 150,
  duration: 60,
  features: ['Calm', 'Therapy'],
  category: 'Massage',
  imageUrl: 'https://example.com/massage.jpg'
};

beforeAll(async () => {
  await prisma.service.deleteMany({ where: { title: testService.title } });

  const res = await request(app)
    .post('/api/services')
    .set('Authorization', `Bearer ${token}`)
    .send(testService);

  serviceId = res.body.data.id;
});

afterAll(async () => {
  await prisma.booking.deleteMany({ where: { userId } });
  await prisma.service.deleteMany({ where: { id: serviceId } });
  await prisma.$disconnect();
});

describe('📦 Service & Booking Tests', () => {
  test('Create booking', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        serviceId,
        appointmentDate: '2025-08-10',
        appointmentTime: '15:00',
        customerName: 'Test User',
        customerEmail: testUser.email,
        customerPhone: testUser.phone,
        specialRequests: 'Quiet room'
      });

    expect(res.statusCode).toBe(201);
    bookingId = res.body.data.id;
  });

  test('Get all bookings', async () => {
    const res = await request(app)
      .get('/api/bookings')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  test('Get booking by ID', async () => {
    const res = await request(app)
      .get(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  test('Update booking', async () => {
    const res = await request(app)
      .put(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerName: 'Updated Name',
        appointmentTime: '16:00'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.customerName).toBe('Updated Name');
  });

  test('Delete booking', async () => {
    const res = await request(app)
      .delete(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});
