import { getAuthToken } from "@/lib/cookie";
import axios from "../axios";
import { ADMIN } from "../endpoints";
const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5050";


export const createUser = async (userData: any) => {
    try {
        const response = await axios.post(
            ADMIN.USER.CREATE,
            userData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data', // for file upload/multer
                }
            }
        );
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Create user failed');
    }
}
export const getUserById = async (id: string) => {
    try {
        const response = await axios.get(
            ADMIN.USER.GET_ONE(id)
        );
        return response.data;
    }
    catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Get user by id failed');
    }
}

export const getAllUsers = async (
  page: number,
  size: number,
  search?: string
) => {
  const token = await getAuthToken();

  const url =
    `${BASE_URL}/api/admin/users?page=${page}&size=${size}` +
    (search ? `&search=${encodeURIComponent(search)}` : "");

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  return await res.json();
};

export const updateUser = async (id: string, updateData: any) => {
    try {
        const response = await axios.put(
            ADMIN.USER.UPDATE(id),
            updateData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data', // for file upload/multer
                }
            }
        );
        return response.data;
    }
    catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Update user failed');
    }
}

export const deleteUser = async (id: string) => {
    try {
        const response = await axios.delete(
            ADMIN.USER.DELETE(id)
        );
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Delete user failed');
    }
}