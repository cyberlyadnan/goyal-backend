export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  DISTRIBUTOR: 'distributor',
  RETAILER: 'retailer',
  STAFF: 'staff',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_HIERARCHY: Role[] = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.DISTRIBUTOR,
  ROLES.STAFF,
  ROLES.RETAILER,
];
