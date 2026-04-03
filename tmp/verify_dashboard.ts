import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  console.log('--- Testing Operator Dashboard Logic ---');
  
  const operator = await prisma.user.findFirst({
    where: { role: 'OPERATOR' }
  });

  if (!operator) {
    console.error('No operator found in DB. Please run seed.');
    return;
  }

  console.log(`Testing for Operator: ${operator.username} (ID: ${operator.id})`);

  // Mocking the service logic
  const where = {
    operatorId: operator.id,
  };

  const aggregate = await prisma.productionEntry.aggregate({
    where,
    _sum: {
      actualQuantity: true,
      rejectionQuantity: true,
      runningHours: true,
    },
    _avg: {
      partsPerHour: true,
    },
  });

  console.log('Stats Result:', {
    totalProduction: aggregate._sum.actualQuantity ?? 0,
    totalRejection: aggregate._sum.rejectionQuantity ?? 0,
    totalRunningHours: Number(aggregate._sum.runningHours ?? 0),
    averagePartsPerHour: Number(aggregate._avg.partsPerHour ?? 0),
  });

  const rejectionReasons = await prisma.rejectionLog.groupBy({
    by: ['reason'],
    where: {
      productionEntry: { is: where },
    },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 5,
  });

  console.log('Rejection Reasons:', rejectionReasons);
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
