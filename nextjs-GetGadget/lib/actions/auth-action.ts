"use server";
import {
  login,
  register,
  requestPasswordReset,
  resetPassword,
} from "@/lib/api/auth";
import { LoginData, RegisterData } from "@/app/(auth)/schema";
import { setAuthToken, setUserData, clearAuthCookies } from "../cookie";
import { redirect } from "next/navigation";
export const handleRegister = async (data: RegisterData) => {
  try {
    const response = await register(data);
    if (response.success) {
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
  } catch (error: Error | any) {
    return {
      success: false,
      message: error.message || "Registration action failed",
    };
  }
};

export const handleLogin = async (data: LoginData) => {
  try {
    const response = await login(data);
   if (response.success) {
  await setAuthToken(response.token);
  await setUserData(response.data);
  return {
    success: true,
    message: "Login successful",
    data: {
      ...response.data,     // all user info
      token: response.token // include the token
    },
  };
}

    return {
      success: false,
      message: response.message || "Login failed",
    };
  } catch (error: Error | any) {
    return { success: false, message: error.message || "Login action failed" };
  }
};

export const handleLogout = async () => {
  await clearAuthCookies();
  return redirect("/login");
};

export const handleRequestPasswordReset = async (email: string) => {
  try {
    const response = await requestPasswordReset(email);
    if (response.success) {
      return {
        success: true,
        message: "Password reset email sent successfully",
      };
    }
    return {
      success: false,
      message: response.message || "Request password reset failed",
    };
  } catch (error: Error | any) {
    return {
      success: false,
      message: error.message || "Request password reset action failed",
    };
  }
};
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5050";
export async function handleResetPassword(token: string, newPassword: string) {
  const url = `${BASE_URL}/api/auth/reset-password/${encodeURIComponent(
    token,
  )}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ newPassword }),
  });

  const text = await res.text();

  try {
    const data = JSON.parse(text);
    if (!res.ok) throw new Error(data.message || "Failed to reset password");
    return data;
  } catch {
    throw new Error(text || "Server returned invalid response");
  }
}
