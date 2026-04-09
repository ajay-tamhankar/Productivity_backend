import { MachinesService } from '../src/machines/machines.service';
import { PrismaService } from '../src/database/prisma.service';

async function verifyMachineSequence() {
  console.log('Verifying MachinesService.findAll field sequence and sorting...');
  
  const mockPrisma = {
    machine: {
      findMany: async (args: any) => {
        console.log('Prisma findMany called with:', JSON.stringify(args, null, 2));
        return [
          {
            id: '1',
            machineNumber: 'M-101',
            name: 'M1',
            status: 'ACTIVE',
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ];
      }
    }
  } as any;

  const service = new MachinesService(mockPrisma);
  const result = await service.findAll();
  
  const order = ['id', 'machineNumber', 'name', 'status', 'createdAt', 'updatedAt'];
  const keys = Object.keys(result[0]);
  
  console.log('Returned keys:', keys);
  
  const matches = order.every((key, index) => keys[index] === key);
  if (matches) {
    console.log('✅ PASS: Field sequence matches');
  } else {
    console.log('❌ FAIL: Field sequence mismatch. Expected:', order, 'Got:', keys);
  }
}

verifyMachineSequence();
