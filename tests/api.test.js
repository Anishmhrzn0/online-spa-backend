import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../server.js';

describe('General API Endpoints', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
    });
  });

  describe('GET /api/admin/dashboard', () => {
    let adminUser;
    let adminToken;
    let regularUser;
    let regularToken;

    beforeEach(async () => {
      // Create admin user
      const hashedPassword = await bcrypt.hash('adminpassword123', 10);
      adminUser = await global.prisma.user.create({
        data: {
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          phone: '+1234567890',
          password: hashedPassword,
          birthDate: new Date('1990-01-01'),
          points: 100,
          membershipStatus: 'Basic',
          isAdmin: true,
          preferences: {
            newsletter: true,
            smsNotifications: false
          },
          isActive: true
        }
      });

      // Create regular user
      const regularHashedPassword = await bcrypt.hash('userpassword123', 10);
      regularUser = await global.prisma.user.create({
        data: {
          firstName: 'Regular',
          lastName: 'User',
          email: 'user@example.com',
          phone: '+1987654321',
          password: regularHashedPassword,
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

      // Create tokens with correct payload structure
      adminToken = jwt.sign(
        { id: adminUser.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );

      regularToken = jwt.sign(
        { id: regularUser.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );
    });

    afterEach(async () => {
      await global.prisma.user.deleteMany();
      await global.prisma.booking.deleteMany();
      await global.prisma.service.deleteMany();
    });

    it('should return admin dashboard data for admin user', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.statistics).toHaveProperty('totalUsers');
    });

    it('should return error for non-admin user', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Not authorized as admin');
    });

    it('should return error without authentication', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Not authorized, no token');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Route /api/nonexistent not found');
    });
  });
}); 