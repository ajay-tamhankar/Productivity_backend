import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('Pushing remaining schema changes (location column and QuantityEditLog table)...');

    // Add location column to ProductionEntry
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "ProductionEntry" ADD COLUMN "location" TEXT`);
      console.log('Added "location" column to "ProductionEntry".');
    } catch (e: any) {
      if (e.message.includes('already exists')) {
        console.log('"location" column already exists.');
      } else {
        console.error('Error adding location column:', e.message);
      }
    }

    // Create QuantityEditLog table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "QuantityEditLog" (
          "id" TEXT NOT NULL,
          "productionEntryId" TEXT NOT NULL,
          "previousQuantity" INTEGER NOT NULL,
          "newQuantity" INTEGER NOT NULL,
          "comment" TEXT NOT NULL,
          "editedById" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "QuantityEditLog_pkey" PRIMARY KEY ("id")
      )
    `);
    console.log('Ensured "QuantityEditLog" table exists.');

    // Create Index
    try {
        await prisma.$executeRawUnsafe(`CREATE INDEX "QuantityEditLog_productionEntryId_idx" ON "QuantityEditLog"("productionEntryId")`);
        console.log('Created index on "QuantityEditLog".');
    } catch (e) {
        // Ignore if exists
    }

    // Add Foreign Keys (Prisma style naming)
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "QuantityEditLog" 
        ADD CONSTRAINT "QuantityEditLog_productionEntryId_fkey" 
        FOREIGN KEY ("productionEntryId") REFERENCES "ProductionEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `);
      console.log('Added foreign key for productionEntryId.');
    } catch (e) {}

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "QuantityEditLog" 
        ADD CONSTRAINT "QuantityEditLog_editedById_fkey" 
        FOREIGN KEY ("editedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      `);
      console.log('Added foreign key for editedById.');
    } catch (e) {}

    console.log('All manual schema updates completed.');
  } catch (error: any) {
    console.error('Fatal error updating schema:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
