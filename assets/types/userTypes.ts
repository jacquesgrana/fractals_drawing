// types/index.ts

export type UserInfo = {
  email: string;
  roles: string[];
  pseudo: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

export type User = {
  id: number;
  email: string;
  roles: string[];
  pseudo: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

export type UserLogin = {
  email: string;
  password: string;
}

export type UserRegister = {
  email: string;
  password: string;
  pseudo: string;
  firstName: string;
  lastName: string;
}

export type UserParams = {
  pseudo: string;
  firstName: string;
  lastName: string;
}

export type UserEmail = {
  email: string;
}

export type UserEmailWithCode = {
  email: string;
  code: string;
}

export type UserPassword = {
  oldPassword: string;
  password: string;
  password2: string;
}