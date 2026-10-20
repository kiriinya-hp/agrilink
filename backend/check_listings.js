import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    const counts = await prisma.produceListing.groupBy({
      by: ['category'],
      _count: { id: true }
    });
    console.log('LISTINGS_BY_CATEGORY:', JSON.stringify(counts, null, 2));
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
