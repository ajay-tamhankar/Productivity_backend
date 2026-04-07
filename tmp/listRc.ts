import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const rcNumbers = await prisma.rcNumber.findMany();
  console.log('RC Numbers in DB:', rcNumbers);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
