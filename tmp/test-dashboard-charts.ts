import { PrismaClient } from '@prisma/client';
import { DashboardService } from '../src/dashboard/dashboard.service';
import { PrismaService } from '../src/database/prisma.service';

async function testCharts() {
  const prisma = new PrismaClient();
  const prismaService = prisma as unknown as PrismaService;
  const dashboardService = new DashboardService(prismaService);

  console.log('Testing Dashboard Chart Endpoints...');

  try {
    const operatorPerformance = await dashboardService.getOperatorPerformance({});
    console.log('--- Operator Performance Chart ---');
    console.log(JSON.stringify(operatorPerformance, null, 2));

    const machineOutput = await dashboardService.getMachineOutput({});
    console.log('--- Machine Output Chart ---');
    console.log(JSON.stringify(machineOutput, null, 2));

    if (Array.isArray(operatorPerformance) && Array.isArray(machineOutput)) {
      console.log('SUCCESS: Endpoints returned data arrays.');
    } else {
      console.log('FAILURE: Endpoints did not return arrays.');
      process.exit(1);
    }
  } catch (error) {
    console.error('ERROR during testing:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testCharts();
