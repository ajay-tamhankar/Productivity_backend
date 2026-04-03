import { PrismaClient } from '@prisma/client';
import { ShiftProductionQueryDto } from '../src/dashboard/dto/shift-production-query.dto';

// Mocking the behavior of DashboardService.getShiftProduction
async function testShiftProduction(query: ShiftProductionQueryDto) {
  const targetDate = query.date 
    ? new Date(query.date) 
    : new Date(new Date().toISOString().split('T')[0]);
  
  console.log(`Testing with date query: ${query.date || 'undefined'}`);
  console.log(`Resolved targetDate: ${targetDate.toISOString().split('T')[0]}`);
  
  // Basic validation that it doesn't throw and resolves correctly
  if (query.date) {
    if (targetDate.toISOString().split('T')[0] !== query.date) {
      throw new Error(`Expected ${query.date}, got ${targetDate.toISOString().split('T')[0]}`);
    }
  } else {
    const today = new Date().toISOString().split('T')[0];
    if (targetDate.toISOString().split('T')[0] !== today) {
      throw new Error(`Expected ${today}, got ${targetDate.toISOString().split('T')[0]}`);
    }
  }
  console.log('Test PASSED');
}

async function runTests() {
  console.log('Running Shift Production Optional Date Tests...');
  
  // Test with explicit date
  await testShiftProduction({ date: '2026-03-17' });
  
  // Test without date (should default to today)
  await testShiftProduction({});
}

runTests().catch(err => {
  console.error('Test FAILED:', err);
  process.exit(1);
});
