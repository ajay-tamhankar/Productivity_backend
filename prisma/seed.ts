import { PrismaClient, MachineStatus, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('ChangeMe123!', 10);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      name: 'System Admin',
      role: Role.ADMIN,
      passwordHash,
    },
  });

  await prisma.user.upsert({
    where: { username: 'supervisor' },
    update: {},
    create: {
      username: 'supervisor',
      name: 'Shift Supervisor',
      role: Role.SUPERVISOR,
      passwordHash,
    },
  });

  await prisma.user.upsert({
    where: { username: 'operator1' },
    update: {},
    create: {
      username: 'operator1',
      name: 'Operator One',
      role: Role.OPERATOR,
      passwordHash,
    },
  });

  await prisma.machine.upsert({
    where: { machineNumber: 'M-101' },
    update: {},
    create: {
      machineNumber: 'M-101',
      name: 'Injection Machine 101',
      status: MachineStatus.ACTIVE,
    },
  });

  await prisma.customer.upsert({
    where: { customerName: 'Acme Corp' },
    update: {},
    create: { customerName: 'Acme Corp' },
  });

  await prisma.item.upsert({
    where: { itemCode: 'ITEM-001' },
    update: {},
    create: {
      itemCode: 'ITEM-001',
      description: 'Plastic Gear Box',
      finishWeight: 125.5,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
