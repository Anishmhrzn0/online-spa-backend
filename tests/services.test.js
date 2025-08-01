import request from 'supertest';
import app from '../server.js';

describe('Services Endpoints', () => {
  let testService;

  beforeEach(async () => {
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
  });

  afterEach(async () => {
    await global.prisma.service.deleteMany();
  });

  describe('GET /api/services', () => {
    it('should return all services', async () => {
      const response = await request(app)
        .get('/api/services')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should filter services by category', async () => {
      const response = await request(app)
        .get('/api/services?category=Massage')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/services/:id', () => {
    it('should return a specific service by ID', async () => {
      const response = await request(app)
        .get(`/api/services/${testService.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', testService.id);
    });

    it('should return 404 for non-existent service', async () => {
      const response = await request(app)
        .get('/api/services/999999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Service not found');
    });
  });
}); 