import { PrismaClient } from '@prisma/client';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';

const prisma = new PrismaClient();

async function testChangePassword() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);

  const user = await prisma.user.findUnique({ where: { username: 'operator1'} });
  if (!user) throw new Error('Operator1 not found');

  // Change password initially (if left at default)
  const defaultPass = 'ChangeMe123!';
  const tempPass = 'NewPass123!';

  try {
    console.log('Attempting to change password...');
    await authService.changePassword(user.id, {
      oldPassword: defaultPass,
      newPassword: tempPass,
    });
    console.log('Password successfully changed!');

    // Change back to default
    console.log('Reverting password back to default...');
    await authService.changePassword(user.id, {
      oldPassword: tempPass,
      newPassword: defaultPass,
    });
    console.log('Password reverted!');
  } catch (err) {
    console.error('Error in testing password change', err);
  }

  await app.close();
  await prisma.$disconnect();
}

testChangePassword().catch(console.error);
