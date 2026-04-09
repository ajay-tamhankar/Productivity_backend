import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Deleting incorrect item data...');
  
  const result = await prisma.item.deleteMany({
    where: {
      itemCode: {
        startsWith: '0205-18',
      },
    },
  });
  
  console.log(`Deleted ${result.count} items.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
