import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const operator = await prisma.user.findUnique({ where: { id: 'cmnhgncpy0002ua4obwkeuuzi' } });
  console.log('operator:', operator ? 'found' : 'not found');

  const machine = await prisma.machine.findUnique({ where: { id: 'cmnhgndnv0003ua4okaptkrkb' } });
  console.log('machine:', machine ? 'found' : 'not found');

  const item = await prisma.item.findUnique({ where: { id: 'cmnhgnfi90005ua4obb87lot1' } });
  console.log('item:', item ? 'found' : 'not found');

  const rcNumber = await prisma.rcNumber.findFirst({
    where: {
      OR: [{ id: 'rc12' }, { rcNumber: 'rc12' }],
    },
  });
  console.log('rcNumber:', rcNumber ? 'found' : 'not found');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
