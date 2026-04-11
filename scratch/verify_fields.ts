import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const rcNumber = 'RC1';
    console.log(`Fetching entries for ${rcNumber}...`);
    const entries = await prisma.productionEntry.findMany({
      where: { rcNumber },
      include: {
        operator: { select: { id: true, name: true } },
        item: { select: { itemCode: true } }
      }
    });
    
    console.log(`Found ${entries.length} entries.`);
    if (entries.length > 0) {
        console.log('Fields in first entry:', Object.keys(entries[0]));
        console.log('Values:', {
            actualQuantity: entries[0].actualQuantity,
            correctedQuantity: entries[0].correctedQuantity
        });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
