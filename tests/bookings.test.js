import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../server.js';

describe('Bookings Endpoints', () => {
  let testUser;
  let testService;
  let testBooking;
  let authToken;

  beforeEach(async () => {
    // Create test user with unique email
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    testUser = await global.prisma.user.create({
      data: {
        firstName: 'Test',
        lastName: 'User',
        email: `test${Date.now()}@example.com`,
        phone: '+1234567890',
        password: hashedPassword,
        birthDate: new Date('1990-01-01'),
        points: 100,
        membershipStatus: 'Basic',
        isAdmin: false,
        preferences: {
          newsletter: true,
          smsNotifications: false
        },
        isActive: true
      }
    });

    // Create test service
    testService = await global.prisma.service.create({
      data: {
        title: 'Test Massage',
        description: 'A relaxing test massage service',
        price: 75.00,
        duration: 60,
        features: ['Relaxation', 'Stress Relief'],
        category: 'Massage',
        sortOrder: 1
      }
    });

    // Create auth token with correct payload structure
    authToken = jwt.sign(
      { id: testUser.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
  });

  afterEach(async () => {
    await global.prisma.booking.deleteMany();
    await global.prisma.user.deleteMany();
    await global.prisma.service.deleteMany();
  });

  describe('POST /api/bookings', () => {
    it('should create a new booking successfully', async () => {
      const bookingData = {
        serviceId: testService.id,
        appointmentDate: '2024-12-25',
        appointmentTime: '14:00',
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        customerPhone: '+1234567890',
        specialRequests: 'Please use lavender oil'
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('pending');
    });

    it('should return error without authentication', async () => {
      const bookingData = {
        serviceId: testService.id,
        appointmentDate: '2024-12-25',
        appointmentTime: '14:00',
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        customerPhone: '+1234567890'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Not authorized, no token');
    });
  });

  describe('GET /api/bookings/my', () => {
    beforeEach(async () => {
      // Create test bookings
      testBooking = await global.prisma.booking.create({
        data: {
          userId: testUser.id,
          serviceId: testService.id,
          appointmentDate: new Date('2024-12-25'),
          appointmentTime: '14:00',
          customerName: 'Test User',
          customerEmail: 'test@example.com',
          customerPhone: '+1234567890',
          status: 'pending',
          totalAmount: 75.00
        }
      });
    });

    it('should return user bookings', async () => {
      const response = await request(app)
        .get('/api/bookings/my')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should return error without authentication', async () => {
      const response = await request(app)
        .get('/api/bookings/my')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Not authorized, no token');
    });
  });

  describe('GET /api/bookings/:id', () => {
    beforeEach(async () => {
      testBooking = await global.prisma.booking.create({
        data: {
          userId: testUser.id,
          serviceId: testService.id,
          appointmentDate: new Date('2024-12-25'),
          appointmentTime: '14:00',
          customerName: 'Test User',
          customerEmail: 'test@example.com',
          customerPhone: '+1234567890',
          status: 'pending',
          totalAmount: 75.00
        }
      });
    });

    it('should return a specific booking by ID', async () => {
      const response = await request(app)
        .get(`/api/bookings/${testBooking.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', testBooking.id);
    });

    it('should return 404 for non-existent booking', async () => {
      const response = await request(app)
        .get('/api/bookings/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Booking not found');
    });
  });

  describe('DELETE /api/bookings/:id', () => {
    beforeEach(async () => {
      testBooking = await global.prisma.booking.create({
        data: {
          userId: testUser.id,
          serviceId: testService.id,
          appointmentDate: new Date('2024-12-25'),
          appointmentTime: '14:00',
          customerName: 'Test User',
          customerEmail: 'test@example.com',
          customerPhone: '+1234567890',
          status: 'pending',
          totalAmount: 75.00
        }
      });
    });

    it('should cancel booking successfully', async () => {
      const response = await request(app)
        .delete(`/api/bookings/${testBooking.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Booking deleted successfully');
    });
  });
}); 