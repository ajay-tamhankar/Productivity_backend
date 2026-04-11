import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const tableInfo = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'User'
    `);
    console.log('User Table Structure:');
    console.table(tableInfo);
  } catch (error) {
    console.error('Error fetching table info:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
