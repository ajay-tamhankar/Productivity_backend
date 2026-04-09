import { BadRequestException } from '@nestjs/common';
import { ProductionService } from '../src/production/production.service';
import { PrismaService } from '../src/database/prisma.service';

// Mock PrismaService
const mockPrisma = {
  productionEntry: {
    create: () => {},
  },
} as any;

const service = new ProductionService(mockPrisma);

async function testValidation() {
  console.log('Testing ProductionService validation logic...');

  // 1. Valid case (sum matches)
  try {
    // Accessing private method for testing purpose
    (service as any).ensureBusinessRules(100, 20, [
      { reason: 'Forging Defects', quantity: 10 },
      { reason: 'Rolling Defects', quantity: 10 },
    ]);
    console.log('✅ PASS: Valid sum accepted');
  } catch (e: any) {
    console.log('❌ FAIL: Valid sum rejected', e.message);
  }

  // 2. Invalid case (sum mismatch)
  try {
    (service as any).ensureBusinessRules(100, 20, [
      { reason: 'Forging Defects', quantity: 10 },
      { reason: 'Rolling Defects', quantity: 5 },
    ]);
    console.log('❌ FAIL: Mismatched sum accepted');
  } catch (e: any) {
    if (e instanceof BadRequestException) {
      console.log('✅ PASS: Mismatched sum rejected correctly:', e.message);
    } else {
      console.log('❌ FAIL: Unexpected error type', e);
    }
  }

  // 3. Rejection > Actual
  try {
    (service as any).ensureBusinessRules(100, 120);
    console.log('❌ FAIL: Rejection > Actual accepted');
  } catch (e: any) {
    if (e instanceof BadRequestException) {
      console.log('✅ PASS: Rejection > Actual rejected correctly:', e.message);
    } else {
      console.log('❌ FAIL: Unexpected error type', e);
    }
  }
}

testValidation();
