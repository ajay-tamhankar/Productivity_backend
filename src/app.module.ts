import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { ItemsModule } from './items/items.module';
import { MasterDataModule } from './master-data/master-data.module';
import { MachinesModule } from './machines/machines.module';
import { ProductionModule } from './production/production.module';
import { ReportsModule } from './reports/reports.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('1d'),
        BCRYPT_SALT_ROUNDS: Joi.number().default(10),
      }),
    }),
    DatabaseModule,
    AuthModule,
    HealthModule,
    UsersModule,
    MachinesModule,
    MasterDataModule,
    CustomersModule,
    ItemsModule,
    ProductionModule,
    DashboardModule,
    ReportsModule,
  ],
})
export class AppModule {}
