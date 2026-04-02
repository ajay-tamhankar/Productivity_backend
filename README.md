# Production Shift Monitoring Backend

Production-ready NestJS backend for the Flutter-based Production Shift Monitoring application.

## Stack
- Node.js + NestJS
- PostgreSQL + Prisma ORM
- JWT authentication
- Role-based access control
- Swagger API documentation

## Modules
- Auth
- Users
- Machines
- Customers
- Items
- Production entries
- Dashboard
- Reports

## Quick Start
```bash
npm install
cp .env.example .env
npm run prisma:generate
npx prisma migrate dev --name init
npm run seed
npm run start:dev
```

Swagger UI is exposed at `/api/docs`.

## Core Business Rules
- `runningHours = endTime - startTime`
- `partsPerHour = actualQuantity / runningHours`
- `weightInKgs = (actualQuantity * finishWeight) / 1000`
- `endTime > startTime`
- `rejectionQuantity <= actualQuantity`
