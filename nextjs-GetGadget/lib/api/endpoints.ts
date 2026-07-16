export const AUTH = {
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register",
  CREATE_USER: "/api/auth/register",
  REQUEST_RESET_PASSWORD: "/api/auth/request-password-reset",
  RESET_PASSWORD: (token: string) => `/api/auth/reset-password/${token}`,
};

export const ADMIN = {
  USER: {
    CREATE: "/api/admin/users",
    GET_ALL: "/api/admin/users/",
    GET_ONE: (userId: string) => `/api/admin/users/${userId}`,
    UPDATE: (userId: string) => `/api/admin/users/${userId}`,
    DELETE: (userId: string) => `/api/admin/users/${userId}`,
  },
};

export const PRODUCT = {
  CREATE: "/api/admin/products",
  GET_ALL: "/api/admin/products",
  UPDATE: (id: string) => `/api/admin/products/${id}`,
  DELETE: (id: string) => `/api/admin/products/${id}`,
};
