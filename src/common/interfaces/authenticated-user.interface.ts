import { Role } from '@prisma/client';

export interface AuthenticatedUser {
  sub: string;
  username: string;
  role: Role;
  name: string;
}
