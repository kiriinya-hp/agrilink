import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding AgriLink database with real authenticated stakeholders and hashed passwords...');

  // 1. Check if database already has users; skip if already seeded to protect registered users
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0 && !process.argv.includes('--force')) {
    console.log(`ℹ️ Database already contains ${existingUsers} users. Preserving existing accounts and skipping seed.`);
    return;
  }

  console.log('Seeding initial stakeholders...');
  await prisma.notification.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.escrowTransaction.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.produceListing.deleteMany();
  await prisma.user.deleteMany();

  // Salt-hashed default password: "Password123!"
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // 2. Create Core Stakeholder Users
  const farmer = await prisma.user.create({
    data: {
      name: 'John Kamau',
      email: 'farmer@agrilink.co.ke',
      phone: '+254711223344',
      password: hashedPassword,
      role: 'FARMER',
      businessName: 'Kiambu Organic Farm Cooperative',
      kycStatus: 'VERIFIED',
      isEmailVerified: true,
      location: 'Limuru, Kiambu County',
      walletBalance: 450.00
    }
  });

  const buyer = await prisma.user.create({
    data: {
      name: 'Fresh Grocers Procurement',
      email: 'buyer@freshgrocers.co.ke',
      phone: '+254722334455',
      password: hashedPassword,
      role: 'BUYER',
      businessName: 'Fresh Grocers Supermarket Ltd',
      kycStatus: 'VERIFIED',
      isEmailVerified: true,
      location: 'Nairobi Central Business District',
      walletBalance: 3200.00
    }
  });

  const transporter = await prisma.user.create({
    data: {
      name: 'David Kipchoge',
      email: 'driver@agrihaul.co.ke',
      phone: '+254733445566',
      password: hashedPassword,
      role: 'TRANSPORTER',
      businessName: 'AgriHaul Logistics Fleet (3-Tonne Isuzu)',
      kycStatus: 'VERIFIED',
      isEmailVerified: true,
      location: 'Nairobi - Nakuru Corridor',
      walletBalance: 120.00
    }
  });

  const transporter2 = await prisma.user.create({
    data: {
      name: 'Samuel Mwangi',
      email: 'samuel@highlandhaul.co.ke',
      phone: '+254744556677',
      password: hashedPassword,
      role: 'TRANSPORTER',
      businessName: 'Highland Express Transit (5-Tonne Canter)',
      kycStatus: 'VERIFIED',
      isEmailVerified: true,
      location: 'Kiambu - Thika - Nairobi Corridor',
      walletBalance: 280.00
    }
  });

  const transporter3 = await prisma.user.create({
    data: {
      name: 'Hassan Ali',
      email: 'hassan@riftfreight.co.ke',
      phone: '+254755667788',
      password: hashedPassword,
      role: 'TRANSPORTER',
      businessName: 'Rift Valley Cold-Chain Logistics',
      kycStatus: 'VERIFIED',
      isEmailVerified: true,
      location: 'Naivasha - Nairobi Route',
      walletBalance: 310.00
    }
  });

  const admin = await prisma.user.create({
    data: {
      name: 'Kelvin Kiriinya',
      email: 'admin@agrilink.co.ke',
      phone: '+254797722331',
      password: hashedPassword,
      role: 'ADMIN',
      businessName: 'AgriLink Operations HQ',
      kycStatus: 'VERIFIED',
      isEmailVerified: true,
      location: 'AgriLink HQ Operations',
      walletBalance: 890.00
    }
  });

  console.log('Created Users with bcrypt hashed passwords:');
  console.log('- Farmer:       farmer@agrilink.co.ke / Password123!');
  console.log('- Buyer:        buyer@freshgrocers.co.ke / Password123!');
  console.log('- Transporters: 3 Active Verified Transporters');
  console.log('- Admin:        admin@agrilink.co.ke / Password123! (Kelvin Kiriinya)');

  // 3. Create Produce Listings
  const listingTomatoes = await prisma.produceListing.create({
    data: {
      farmerId: farmer.id,
      cropName: 'Roma Plum Tomatoes',
      category: 'HORTICULTURE',
      availableQty: 850,
      unitPrice: 0.75, // $0.75 / KES ~95 per kg
      grade: 'GRADE_A',
      harvestDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      location: 'Limuru, Kiambu',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop'
    }
  });

  const listingOnions = await prisma.produceListing.create({
    data: {
      farmerId: farmer.id,
      cropName: 'Red Bulb Onions',
      category: 'HORTICULTURE',
      availableQty: 1400,
      unitPrice: 0.60,
      grade: 'GRADE_A',
      harvestDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      location: 'Kajiado Central',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop'
    }
  });

  const listingAvocados = await prisma.produceListing.create({
    data: {
      farmerId: farmer.id,
      cropName: 'Hass Avocados (Export Quality)',
      category: 'HORTICULTURE',
      availableQty: 600,
      unitPrice: 1.20,
      grade: 'GRADE_A',
      harvestDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      location: 'Murang\'a South',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&auto=format&fit=crop'
    }
  });

  const listingPotatoes = await prisma.produceListing.create({
    data: {
      farmerId: farmer.id,
      cropName: 'Shangi Irish Potatoes',
      category: 'TUBER',
      availableQty: 2500,
      unitPrice: 0.45,
      grade: 'STANDARD',
      harvestDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      location: 'Ol Kalou, Nyandarua',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop'
    }
  });

  const listingMaize = await prisma.produceListing.create({
    data: {
      farmerId: farmer.id,
      cropName: 'Dry White Maize Grains',
      category: 'CEREAL',
      availableQty: 5000,
      unitPrice: 0.35,
      grade: 'GRADE_B',
      harvestDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      location: 'Kitale, Trans-Nzoia',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop'
    }
  });

  // 4. Create an Initial Order in Escrow
  const orderAmount = 200 * 0.75;
  const transportFee = 25.00;
  const platformFee = 7.50;
  const grandTotal = orderAmount + transportFee + platformFee;

  const order = await prisma.order.create({
    data: {
      orderNumber: 'AGR-2026-1082',
      buyerId: buyer.id,
      totalAmount: orderAmount,
      transportFee: transportFee,
      platformFee: platformFee,
      grandTotal: grandTotal,
      status: 'IN_TRANSIT',
      deliveryAddress: 'Fresh Grocers Central Depot, Warehouse 4B, Industrial Area, Nairobi',
      notes: 'Please pack in ventilated crates.',
      items: {
        create: {
          listingId: listingTomatoes.id,
          cropName: listingTomatoes.cropName,
          quantity: 200,
          unitPrice: 0.75,
          subtotal: orderAmount
        }
      },
      escrowTransaction: {
        create: {
          reference: 'ESC-MPESA-8842194',
          paymentGateway: 'MPESA_STK',
          amountHeld: grandTotal,
          status: 'HELD',
          checkoutRequestId: 'ws_CO_1809202610552093847291',
          merchantRequestId: '29103-99281-1'
        }
      },
      shipment: {
        create: {
          transporterId: transporter.id,
          vehicleReg: 'KBZ 489L (3-Tonne Isuzu Truck)',
          pickupLocation: 'Limuru, Kiambu (Farm Gate #2)',
          dropoffLocation: 'Fresh Grocers Depot, Nairobi',
          transitStatus: 'IN_TRANSIT',
          confirmationOtp: '4819'
        }
      }
    }
  });

  // 5. Seed Welcome & Order Notifications
  await prisma.notification.create({
    data: {
      userId: buyer.id,
      type: 'EMAIL',
      title: 'Order AGR-2026-1082 Escrow Funded',
      message: `Your payment of $${grandTotal.toFixed(2)} is secured in AgriLink Escrow. Produce dispatched with AgriHaul Fleet. Delivery OTP is 4819.`,
      metadata: JSON.stringify({ orderNumber: order.orderNumber, grandTotal })
    }
  });

  await prisma.notification.create({
    data: {
      userId: farmer.id,
      type: 'SMS',
      title: 'New Order Received',
      message: `Order #AGR-2026-1082 funded in escrow! 200kg Roma Tomatoes reserved for Fresh Grocers. Driver David Kipchoge assigned.`,
      metadata: JSON.stringify({ orderNumber: order.orderNumber })
    }
  });

  console.log('Database seeded with real authentication records, transporters, and notifications successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
