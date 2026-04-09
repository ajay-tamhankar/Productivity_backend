# Production Shift Monitoring Backend

This document is the API handoff for Antigravity to continue frontend or service integration.

## Stack

- Backend: Node.js + NestJS
- Database: PostgreSQL
- ORM: Prisma
- Auth: JWT Bearer token
- Docs: Swagger at `/api/docs`

## Local Base URL

- Local API base: `http://localhost:3000/api`
- Swagger JSON: `http://localhost:3000/api/docs-json`
- Swagger UI: `http://localhost:3000/api/docs`

## Auth Model

- All endpoints require `Authorization: Bearer <token>` except login.
- Login endpoint:
  - `POST /api/auth/login`

### Login Request

```json
{
  "username": "admin",
  "password": "ChangeMe123!"
}
```

### Login Response

```json
{
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "username": "admin",
    "name": "System Admin",
    "role": "ADMIN"
  }
}
```

## Seeded Test Users

- Admin
  - `username`: `admin`
  - `password`: `ChangeMe123!`
- Supervisor
  - `username`: `supervisor`
  - `password`: `ChangeMe123!`
- Operator
  - `username`: `operator1`
  - `password`: `ChangeMe123!`

## Roles

- `ADMIN`
- `SUPERVISOR`
- `OPERATOR`

## Enums

### Shift

- `A`
- `B`
- `C`

### MachineStatus

- `ACTIVE`
- `IDLE`
- `MAINTENANCE`
- `INACTIVE`

### ApprovalStatus

- `PENDING`
- `APPROVED`
- `REJECTED`

## Core Business Rules

- `runningHours = endTime - startTime`
- `partsPerHour = actualQuantity / runningHours`
- `weightInKgs = (actualQuantity * finishWeight) / 1000`
- `endTime > startTime`
- `rejectionQuantity <= actualQuantity`

The backend computes `runningHours`, `partsPerHour`, and `weightInKgs` server-side. The client should not send them.

## Integration Sequence

1. Login and store JWT.
2. Load dropdown data:
   - `/api/master-data/machines`
   - `/api/master-data/items`
   - `/api/master-data/customers`
   - `/api/master-data/rejection-reasons`
3. Submit production entries with foreign key IDs.
4. Load operator feed, dashboard, and reports based on role.

## Master Data Endpoints

### Get Machines

- `GET /api/master-data/machines`

Response:

```json
[
  {
    "id": "machine-id",
    "machineNumber": "M-101",
    "name": "Injection Machine 101",
    "status": "ACTIVE"
  }
]
```

### Get Items

- `GET /api/master-data/items`

Response:

```json
[
  {
    "id": "item-id",
    "itemCode": "ITEM-001",
    "description": "Plastic Gear Box",
    "finishWeight": "125.5"
  }
]
```

Note:
- Prisma decimal values may arrive as strings in JSON. Treat `finishWeight`, `runningHours`, `partsPerHour`, and `weightInKgs` as numeric strings or numbers on the client.

### Get Customers

- `GET /api/master-data/customers`

Response:

```json
[
  {
    "id": "customer-id",
    "customerName": "Acme Corp"
  }
]
```

### Get Rejection Reasons

- `GET /api/master-data/rejection-reasons`

Response:

```json
[
  "Forging Defects",
  "Rolling Defects",
  "Finishing defects",
  "All Process defect"
]
```

## Production Entry API

### Create Production Entry

- `POST /api/production/entry`

Request:

```json
{
  "entryDate": "2026-03-17",
  "shift": "A",
  "operatorId": "operator-user-id",
  "machineId": "machine-id",
  "customerId": "customer-id",
  "itemId": "item-id",
  "ccd1Quantity": 0,
  "actualQuantity": 1200,
  "rejectionQuantity": 20,
  "startTime": "2026-03-17T08:00:00.000Z",
  "endTime": "2026-03-17T16:30:00.000Z",
  "notes": "Shift completed",
  "rejectionDetails": [
    { "reason": "Forging Defects", "quantity": 8 },
    { "reason": "Rolling Defects", "quantity": 12 }
  ]
}
```

Response:

```json
{
  "id": "entry-id",
  "entryDate": "2026-03-17T00:00:00.000Z",
  "shift": "A",
  "actualQuantity": 1200,
  "rejectionQuantity": 20,
  "runningHours": "8.5",
  "partsPerHour": "141.18",
  "weightInKgs": "150.6",
  "approvalStatus": "APPROVED"
}
```

### Validation Errors

If `endTime <= startTime`:

```json
{
  "message": ["endTime must be greater than startTime"],
  "error": "Bad Request",
  "statusCode": 400
}
```

If `rejectionQuantity > actualQuantity`:

```json
{
  "message": ["rejectionQuantity must be less than or equal to actualQuantity"],
  "error": "Bad Request",
  "statusCode": 400
}
```

### Other Production Endpoints

- `GET /api/production/entries`
- `GET /api/production/entries/:id`
- `PATCH /api/production/entries/:id`
- `DELETE /api/production/entries/:id`
- `GET /api/production/operator-feed?page=1&limit=10`

## Dashboard Endpoints

- `GET /api/dashboard/kpi?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- `GET /api/dashboard/shift-production?date=YYYY-MM-DD`
- `GET /api/dashboard/rejection-reasons?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

### KPI Response

```json
{
  "totalProduction": 1200,
  "totalRejection": 20,
  "totalRunningHours": 8.5,
  "averagePartsPerHour": 141.18
}
```

## Reports Endpoints

- `GET /api/reports/detailed?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&page=1&limit=10`
- `GET /api/reports/daily-production?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- `GET /api/reports/shift-wise?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- `GET /api/reports/operator-performance?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- `GET /api/reports/machine-performance?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- `GET /api/reports/rejection-analysis?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

## Admin CRUD Endpoints

### Users

- `GET /api/users`
- `POST /api/users`
- `GET /api/users/:id`
- `PATCH /api/users/:id`
- `DELETE /api/users/:id`

### Machines

- `GET /api/machines`
- `POST /api/machines`
- `GET /api/machines/:id`
- `PATCH /api/machines/:id`
- `DELETE /api/machines/:id`

### Customers

- `GET /api/customers`
- `POST /api/customers`
- `GET /api/customers/:id`
- `PATCH /api/customers/:id`
- `DELETE /api/customers/:id`

### Items

- `GET /api/items`
- `POST /api/items`
- `GET /api/items/:id`
- `PATCH /api/items/:id`
- `DELETE /api/items/:id`

## Role Access Summary

- `ADMIN`
  - Full access
- `SUPERVISOR`
  - Dashboard and reports
  - Production entry review/update
- `OPERATOR`
  - Login
  - Master data
  - Create production entry
  - View own operator feed

## Headers

Use these headers for JSON requests:

```http
Content-Type: application/json
Authorization: Bearer <token>
```

## cURL Examples

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"ChangeMe123!"}'
```

### Get Machines

```bash
curl http://localhost:3000/api/master-data/machines \
  -H "Authorization: Bearer <token>"
```

### Create Production Entry

```bash
curl -X POST http://localhost:3000/api/production/entry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "entryDate":"2026-03-17",
    "shift":"A",
    "operatorId":"operator-user-id",
    "machineId":"machine-id",
    "customerId":"customer-id",
    "itemId":"item-id",
    "ccd1Quantity":0,
    "actualQuantity":1200,
    "rejectionQuantity":20,
    "startTime":"2026-03-17T08:00:00.000Z",
    "endTime":"2026-03-17T16:30:00.000Z"
  }'
```

## Notes For Antigravity

- The Flutter app should cache master data where possible.
- Use IDs from master-data responses, not display names, for create/update calls.
- Time fields should be sent in ISO-8601 format.
- Dashboard and reports are role-restricted.
- Server-side validation is already active; surface backend error messages directly in the UI.
- Swagger reflects the live route surface and should be treated as the source of truth during integration.

## Repo Reference

- Backend repo: [Productivity_backend](https://github.com/ajay-tamhankar/Productivity_backend)
