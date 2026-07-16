import { LoginData, RegisterData } from "@/app/(auth)/schema";
import axios from "./axios";
import { AUTH } from "./endpoints";

export const register = async (registerData: RegisterData) => {
  try {
    const response = await axios.post(AUTH.REGISTER, registerData);
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || "Registration failed",
    );
  }
};

export const login = async (loginData: LoginData) => {
  try {
    const response = await axios.post(AUTH.LOGIN, loginData);
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || "Login failed",
    );
  }
};

export const requestPasswordReset = async (email: string) => {
  try {
    const response = await axios.post(AUTH.REQUEST_RESET_PASSWORD, {
      email,
    });
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Request password reset failed",
    );
  }
};

export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const response = await axios.post(AUTH.RESET_PASSWORD(token), {
      newPassword: newPassword,
    });
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || "Reset password failed",
    );
  }
};
