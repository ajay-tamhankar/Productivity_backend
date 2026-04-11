import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { MachinesService } from '../src/machines/machines.service';

const mockPrisma = {
  machine: {
    findUnique: async () => ({ id: '1', machineNumber: 'M1' }),
    delete: async () => {
      const error = new Error('Foreign key constraint failed') as any;
      error.code = 'P2003';
      throw new Prisma.PrismaClientKnownRequestError(error.message, {
        code: 'P2003',
        clientVersion: '1.0',
      });
    },
  },
} as any;

const service = new MachinesService(mockPrisma);

async function testDeletionFix() {
  console.log('Testing MachinesService error handling for deletion...');

  try {
    await service.remove('1');
    console.log('❌ FAIL: Expected ConflictException but got success');
  } catch (e: any) {
    if (e instanceof ConflictException) {
      console.log('✅ PASS: Caught ConflictException:', e.message);
    } else {
      console.log('❌ FAIL: Caught unexpected error type', e);
    }
  }
}

testDeletionFix();
