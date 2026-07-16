"use server";

import { cookies } from "next/headers";

interface UserData {
  _id: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export const setAuthToken = async (token: string) => {
  const cookieStore = cookies();
  (await cookieStore).set({
    name: "token",
    value: token,
  });
};

export const getAuthToken = async () => {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value || null;
};

export const setUserData = async (userData: UserData) => {
  const cookieStore = cookies();
  (await cookieStore).set({
    name: "user_data",
    value: JSON.stringify(userData),
  });
};

export const getUserData = async () => {
  const cookieStore = await cookies();
  const userData = cookieStore.get("user_data")?.value || null;
  return userData ? JSON.parse(userData) : null;
};

export const clearAuthCookies = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  cookieStore.delete("user_data");
};
