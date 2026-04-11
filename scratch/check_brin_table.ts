import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('Checking Role Enum values...');
    const roles: any[] = await prisma.$queryRawUnsafe(`
      SELECT enumlabel FROM pg_enum 
      JOIN pg_type ON pg_enum.enum_typid = pg_type.oid 
      WHERE pg_type.typname = 'Role'
    `);
    console.table(roles);

    console.log('Checking BrinActivity table structure...');
    const tableInfo: any[] = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'BrinActivity'
    `);
    console.table(tableInfo);
  } catch (error) {
    console.error('Error occurred during check:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
