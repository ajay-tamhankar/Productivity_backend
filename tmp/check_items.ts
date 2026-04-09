import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const itemsCount = await prisma.item.count();
  console.log(`Total items in DB: ${itemsCount}`);
  
  const items = await prisma.item.findMany({ take: 100 });
  console.log(JSON.stringify(items, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
