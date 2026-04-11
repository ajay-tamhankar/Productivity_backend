import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('Attempting to add BRIN to Role enum...');
    // We use $executeRawUnsafe because $executeRaw with parameters doesn't work well for ALTER TYPE
    await prisma.$executeRawUnsafe(`ALTER TYPE "Role" ADD VALUE 'BRIN'`);
    console.log('Successfully added BRIN to Role enum.');
  } catch (error: any) {
    if (error.message && error.message.includes('already exists')) {
      console.log('BRIN already exists in Role enum.');
    } else {
      console.error('Error updating enum:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
