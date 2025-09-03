export const ADMIN_EMAIL = process.env['ADMIN_EMAIL'] ?? 'admin@example.com';
export const ADMIN_PASSWORD = process.env['ADMIN_PASSWORD'] ?? 'admin123';

export interface Person {
  firstName: string;
  lastName: string;
  personalCode?: string;
}

export interface Admin {
  email: string;
  password: string;
}

const MARI_MAASIKAS: Person = {
  firstName: 'Mari',
  lastName: 'Maasikas',
  personalCode: '11111111111',
};

const ADMIN: Admin = {
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
};


export const USERS = {
  MARI_MAASIKAS,
  ADMIN
};
