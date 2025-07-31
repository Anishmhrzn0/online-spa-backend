import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Check if services exist, if not create them
  const existingServices = await prisma.service.count();
  
  if (existingServices === 0) {
    console.log('📊 Creating sample services...');
    
    // Create sample services
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

    console.log(`✅ Created ${services.length} services`);
  } else {
    console.log(`📊 Services already exist (${existingServices} services found)`);
  }

  // Check if admin user exists
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@spa.com' }
  });

  if (adminUser) {
    console.log(`👤 Admin user already exists: ${adminUser.email}`);
  } else {
    console.log('👤 Admin user not found - the server will create it automatically');
  }

  console.log('✅ Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 