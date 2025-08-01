import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../server.js';

describe('Authentication Endpoints', () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    // Create a test user with unique email
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
  });

  afterEach(async () => {
    await global.prisma.user.deleteMany();
  });

  describe('JWT Token Test', () => {
    it('should create and verify JWT token correctly', () => {
      const secret = process.env.JWT_SECRET || 'your-secret-key';
      const token = jwt.sign({ id: testUser.id }, secret, { expiresIn: '1h' });
      const decoded = jwt.verify(token, secret);
      
      expect(decoded.id).toBe(testUser.id);
    });
  });

  describe('Protected Route Access Test', () => {
    it('should access protected route with valid JWT token', async () => {
      const secret = process.env.JWT_SECRET || 'your-secret-key';
      const token = jwt.sign({ id: testUser.id }, secret, { expiresIn: '1h' });
      
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.email).toBe(testUser.email);
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: `john.doe${Date.now()}@example.com`,
        phone: '+1987654321',
        password: 'securepassword123',
        birthDate: '1995-05-15'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body).toHaveProperty('token');
    });

    it('should return error for duplicate email', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: testUser.email, // Same email as test user
        phone: '+1987654321',
        password: 'securepassword123',
        birthDate: '1995-05-15'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('User with this email already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user with valid credentials', async () => {
      const loginData = {
        email: testUser.email,
        password: 'testpassword123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body).toHaveProperty('token');
    });

    it('should return error for invalid credentials', async () => {
      const loginData = {
        email: testUser.email,
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    beforeEach(async () => {
      authToken = jwt.sign(
        { id: testUser.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );
    });

    it('should return current user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.email).toBe(testUser.email);
    });

    it('should return error without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Not authorized, no token');
    });
  });
}); 