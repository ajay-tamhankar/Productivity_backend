import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateRejectionReasons() {
  console.log('Starting migration of rejection reasons...');

  const mapping = {
    'Scratch': 'Forging Defects',
    'Dent': 'Rolling Defects',
    'Discoloration': 'Finishing defects',
    'Flash': 'All Process defect',
    'Short Shot': 'All Process defect',
  };

  let totalUpdated = 0;

  for (const [oldReason, newReason] of Object.entries(mapping)) {
    const { count } = await prisma.rejectionLog.updateMany({
      where: {
        reason: {
          equals: oldReason,
          mode: 'insensitive',
        },
      },
      data: {
        reason: newReason,
      },
    });
    console.log(`Updated ${count} records from "${oldReason}" to "${newReason}"`);
    totalUpdated += count;
  }

  console.log(`Migration complete. Total records updated: ${totalUpdated}`);
}

migrateRejectionReasons()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
