import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('Attempting to add correctedQuantity column to ProductionEntry via raw SQL...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "ProductionEntry" 
      ADD COLUMN IF NOT EXISTS "correctedQuantity" INTEGER;
    `);
    console.log('Column added successfully.');

    // Also update existing records to have 0 (or null) - though Postgres already defaults to NULL
    
    const tableInfo: any[] = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'ProductionEntry' AND column_name = 'correctedQuantity'
    `);
    console.table(tableInfo);
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
