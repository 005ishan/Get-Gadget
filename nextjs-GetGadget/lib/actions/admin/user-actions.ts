"use server";

import {
  createUser,
  deleteUser,
  getUserById,
  updateUser,
} from "@/lib/api/admin/user";
import { ADMIN } from "@/lib/api/endpoints";
import { getAuthToken } from "@/lib/cookie";
import { revalidatePath } from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const handleCreateUser = async (data: FormData) => {
  try {
    const response = await createUser(data);

    if (response.success) {
      revalidatePath("/admin/users");
      return {
        success: true,
        message: "Registration successful",
        data: response.data,
      };
    }

    return {
      success: false,
      message: response.message || "Registration failed",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Registration action failed",
    };
  }
};

export const handleGetAllUsers = async (
  page: string,
  size: string,
  search?: string
) => {
  try {
    const token = await getAuthToken();

    if (!token) {
      return { success: false, message: "Unauthorized: No token found" };
    }

    // ✅ VERY IMPORTANT FIX — FULL ABSOLUTE URL
    const url =
      `${BASE_URL}${ADMIN.USER.GET_ALL}?page=${page}&size=${size}` +
      (search ? `&search=${encodeURIComponent(search)}` : "");

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data.message || "Failed to fetch users",
      };
    }

    return {
      success: true,
      data: data.data,
      pagination: data.pagination,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Fetch users action failed",
    };
  }
};

export const handleGetOneUser = async (id: string) => {
  try {
    const response = await getUserById(id);

    if (response.success) {
      return {
        success: true,
        message: "Get user by id successful",
        data: response.data,
      };
    }

    return {
      success: false,
      message: response.message || "Get user by id failed",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Get user by id action failed",
    };
  }
};

export const handleUpdateUser = async (id: string, data: FormData) => {
  try {
    const response = await updateUser(id, data);

    if (response.success) {
      revalidatePath("/admin/users");

      return {
        success: true,
        message: "Update user successful",
        data: response.data,
      };
    }

    return {
      success: false,
      message: response.message || "Update user failed",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Update user action failed",
    };
  }
};

export const handleDeleteUser = async (id: string) => {
  try {
    const response = await deleteUser(id);

    if (response.success) {
      revalidatePath("/admin/users");

      return {
        success: true,
        message: "Delete user successful",
      };
    }

    return {
      success: false,
      message: response.message || "Delete user failed",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Delete user action failed",
    };
  }
};
