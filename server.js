import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './lib/prisma.js';
import bcrypt from 'bcryptjs';
import { exec } from 'child_process';
import { promisify } from 'util';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import bookingRoutes from './routes/bookings.js';
import serviceRoutes from './routes/services.js';
import { protect, admin } from './middleware/auth.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const execAsync = promisify(exec);

// Function to create database tables
async function createTables() {
  try {
    console.log('🔄 Creating database tables...');
    await execAsync('npx prisma db push --accept-data-loss');
    console.log('✅ Database tables created successfully');
    return true;
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    return false;
  }
}

// Function to create admin user
async function createAdminUser() {
  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@spa.com' }
    });
    
    if (!existingAdmin) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@spa.com',
          phone: '+1234567890',
          password: adminPassword,
          birthDate: new Date('1990-01-01'),
          points: 1000,
          membershipStatus: 'VIP',
          isAdmin: true,
          preferences: {
            newsletter: true,
            smsNotifications: true
          },
          isActive: true
        }
      });
      console.log('👤 Admin user created successfully');
    } else {
      console.log('👤 Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  }
}

// Function to create sample services
async function createSampleServices() {
  try {
    const existingServices = await prisma.service.count();
    
    if (existingServices === 0) {
      console.log('📊 Creating sample services...');
      
      const services = [
        {
          title: 'Swedish Massage',
          description: 'A gentle form of massage that uses long strokes, kneading, and circular movements on superficial layers of muscle using massage lotion or oil.',
          price: 80.00,
          duration: 60,
          features: ['Relaxation', 'Stress Relief', 'Improved Circulation'],
          category: 'Massage',
          sortOrder: 1
        },
        {
          title: 'Deep Tissue Massage',
          description: 'A therapeutic massage that targets the deeper layers of muscles and connective tissue to release chronic muscle tension.',
          price: 100.00,
          duration: 60,
          features: ['Pain Relief', 'Muscle Recovery', 'Improved Mobility'],
          category: 'Massage',
          sortOrder: 2
        },
        {
          title: 'Hot Stone Massage',
          description: 'A massage therapy that uses smooth, heated stones to warm and relax your muscles, allowing the therapist to apply deeper pressure.',
          price: 120.00,
          duration: 75,
          features: ['Deep Relaxation', 'Muscle Tension Relief', 'Improved Blood Flow'],
          category: 'Massage',
          sortOrder: 3
        },
        {
          title: 'Classic Facial',
          description: 'A basic facial treatment that includes cleansing, exfoliation, extraction, and moisturizing to improve skin health and appearance.',
          price: 70.00,
          duration: 45,
          features: ['Skin Cleansing', 'Exfoliation', 'Hydration'],
          category: 'Facial',
          sortOrder: 4
        },
        {
          title: 'Anti-Aging Facial',
          description: 'Advanced facial treatment designed to reduce fine lines, wrinkles, and improve skin elasticity with premium products.',
          price: 90.00,
          duration: 60,
          features: ['Anti-Aging', 'Collagen Boost', 'Skin Firming'],
          category: 'Facial',
          sortOrder: 5
        },
        {
          title: 'Body Scrub',
          description: 'Exfoliating treatment that removes dead skin cells, improves circulation, and leaves skin smooth and refreshed.',
          price: 85.00,
          duration: 45,
          features: ['Exfoliation', 'Skin Renewal', 'Improved Texture'],
          category: 'BodyTreatment',
          sortOrder: 6
        },
        {
          title: 'Aromatherapy Session',
          description: 'Therapeutic treatment using essential oils to promote physical and emotional well-being through inhalation and topical application.',
          price: 75.00,
          duration: 50,
          features: ['Stress Relief', 'Mood Enhancement', 'Natural Healing'],
          category: 'Wellness',
          sortOrder: 7
        },
        {
          title: 'Couples Massage',
          description: 'Romantic massage experience for two people in a private room, perfect for special occasions or relaxation together.',
          price: 160.00,
          duration: 60,
          features: ['Couples Experience', 'Private Room', 'Romantic Setting'],
          category: 'Specialty',
          sortOrder: 8
        }
      ];

      for (const service of services) {
        await prisma.service.create({
          data: service
        });
      }
      
      console.log(`✅ Created ${services.length} sample services`);
    } else {
      console.log(`📊 Services already exist (${existingServices} services found)`);
    }
  } catch (error) {
    console.error('❌ Error creating sample services:', error.message);
  }
}

// Test database connection and setup
prisma.$connect()
  .then(async () => {
    console.log('✅ Database connected successfully');
    
    // Create tables first
    const tablesCreated = await createTables();
    
    if (tablesCreated) {
      // Then create admin user and services
      await createAdminUser();
      await createSampleServices();
    }
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err);
  });

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AquaLux Spa API is running',
    timestamp: new Date().toISOString()
  });
});

// Admin Dashboard endpoint
app.get('/api/admin/dashboard', protect, admin, async (req, res) => {
  try {
    // Get comprehensive system statistics
    const [
      totalUsers,
      totalBookings,
      totalServices,
      recentBookings,
      userStats,
      bookingStats
    ] = await Promise.all([
      prisma.user.count(),
      prisma.booking.count(),
      prisma.service.count(),
      prisma.booking.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true }
          },
          service: {
            select: { title: true, price: true }
          }
        }
      }),
      prisma.user.groupBy({
        by: ['membershipStatus'],
        _count: { membershipStatus: true }
      }),
      prisma.booking.groupBy({
        by: ['status'],
        _count: { status: true }
      })
    ]);

    // Calculate revenue
    const completedBookings = await prisma.booking.findMany({
      where: { status: 'completed' },
      select: { totalAmount: true }
    });
    
    const totalRevenue = completedBookings.reduce((sum, booking) => {
      return sum + parseFloat(booking.totalAmount);
    }, 0);

    res.json({
      success: true,
      data: {
        statistics: {
          totalUsers,
          totalBookings,
          totalServices,
          totalRevenue: parseFloat(totalRevenue.toFixed(2))
        },
        recentBookings,
        userStats,
        bookingStats
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin dashboard data'
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.originalUrl} not found` 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

export default app; 