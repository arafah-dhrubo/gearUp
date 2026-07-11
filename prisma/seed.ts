import 'dotenv/config';
import pg from 'pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

const url = new URL(process.env.DATABASE_URL!);
const ssl = url.searchParams.get('sslmode') === 'require' ? { rejectUnauthorized: false } : undefined;
const pool = new pg.Pool({
  host: url.hostname,
  port: parseInt(url.port || '5432'),
  database: url.pathname.slice(1).split('?')[0],
  user: url.username,
  password: url.password,
  ssl,
  max: 5,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const providerPassword = await bcrypt.hash('Provider@123', 12);
  const customerPassword = await bcrypt.hash('Customer@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@gearup.com' },
    update: {},
    create: { email: 'admin@gearup.com', password: adminPassword, name: 'Admin', role: 'ADMIN' },
  });

  const provider = await prisma.user.upsert({
    where: { email: 'provider@gearup.com' },
    update: {},
    create: { email: 'provider@gearup.com', password: providerPassword, name: 'Gear Provider', phone: '1234567890', role: 'PROVIDER' },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@gearup.com' },
    update: {},
    create: { email: 'customer@gearup.com', password: customerPassword, name: 'Test Customer', phone: '9876543210', role: 'CUSTOMER' },
  });

  const categories = [
    { name: 'Cycling', description: 'Bicycles, helmets, and cycling accessories' },
    { name: 'Camping', description: 'Tents, sleeping bags, and camping gear' },
    { name: 'Fitness', description: 'Gym equipment and fitness accessories' },
    { name: 'Water Sports', description: 'Kayaks, paddleboards, and snorkeling gear' },
    { name: 'Winter Sports', description: 'Skis, snowboards, and winter gear' },
  ];

  const createdCategories: Record<string, string> = {};
  for (const cat of categories) {
    const c = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
    createdCategories[cat.name] = c.id;
  }

  const gearItems = [
    { name: 'Mountain Bike Pro', description: 'Full suspension mountain bike, 29-inch wheels, 21-speed', brand: 'Trek', pricePerDay: 35, quantity: 5, category: 'Cycling' },
    { name: 'Road Bike Elite', description: 'Lightweight carbon frame road bike', brand: 'Specialized', pricePerDay: 45, quantity: 3, category: 'Cycling' },
    { name: 'Cycling Helmet', description: 'Aerodynamic cycling helmet with ventilation', brand: 'Giro', pricePerDay: 8, quantity: 10, category: 'Cycling' },
    { name: '4-Person Tent', description: 'Waterproof 4-person tent with rainfly', brand: 'Coleman', pricePerDay: 25, quantity: 4, category: 'Camping' },
    { name: 'Sleeping Bag -30°C', description: 'Extreme cold weather sleeping bag', brand: 'Marmot', pricePerDay: 15, quantity: 6, category: 'Camping' },
    { name: 'Camping Stove', description: 'Portable propane camping stove, 2-burner', brand: 'Camp Chef', pricePerDay: 12, quantity: 8, category: 'Camping' },
    { name: 'Adjustable Dumbbells', description: '5-50lb adjustable dumbbell set', brand: 'Bowflex', pricePerDay: 10, quantity: 3, category: 'Fitness' },
    { name: 'Yoga Mat Premium', description: 'Extra thick non-slip yoga mat', brand: 'Manduka', pricePerDay: 5, quantity: 15, category: 'Fitness' },
    { name: 'Kayak Single', description: 'Single-person sit-in kayak with paddle', brand: 'Pelican', pricePerDay: 30, quantity: 4, category: 'Water Sports' },
    { name: 'Paddleboard', description: 'Inflatable stand-up paddleboard with pump', brand: 'Tower', pricePerDay: 28, quantity: 3, category: 'Water Sports' },
    { name: 'Snorkel Set', description: 'Professional snorkel mask and fin set', brand: 'Cressi', pricePerDay: 10, quantity: 10, category: 'Water Sports' },
    { name: 'Skis Package', description: 'Alpine skis with bindings and poles', brand: 'Rossignol', pricePerDay: 40, quantity: 3, category: 'Winter Sports' },
    { name: 'Snowboard', description: 'All-mountain snowboard with bindings', brand: 'Burton', pricePerDay: 35, quantity: 3, category: 'Winter Sports' },
    { name: 'Winter Jacket', description: 'Insulated waterproof winter jacket', brand: 'The North Face', pricePerDay: 18, quantity: 7, category: 'Winter Sports' },
    { name: 'Treadmill', description: 'Electric treadmill with incline settings', brand: 'NordicTrack', pricePerDay: 20, quantity: 2, category: 'Fitness' },
  ];

  for (const gear of gearItems) {
    const id = `seed-${gear.name.replace(/\s+/g, '-').toLowerCase()}`;
    const existing = await prisma.gearItem.findUnique({ where: { id } });
    if (!existing) {
      await prisma.gearItem.create({
        data: {
          id,
          name: gear.name,
          description: gear.description,
          brand: gear.brand,
          pricePerDay: gear.pricePerDay,
          quantity: gear.quantity,
          available: true,
          categoryId: createdCategories[gear.category],
          providerId: provider.id,
        },
      });
    }
  }

  console.log('Seed data loaded successfully');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
