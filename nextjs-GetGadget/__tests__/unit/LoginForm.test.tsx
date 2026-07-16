import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const mockSignIn = jest.fn();
jest.mock("next-auth/react", () => ({
  signIn: (...args: any[]) => mockSignIn(...args),
}));

const mockLogin = jest.fn();
jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ login: mockLogin }),
}));

const mockHandleLogin = jest.fn();
jest.mock("@/lib/actions/auth-action", () => ({
  handleLogin: (...args: any[]) => mockHandleLogin(...args),
}));

jest.mock("@/lib/toast", () => ({
  AppToast: {
    success: jest.fn(),
    error: jest.fn(),
    promise: jest.fn((p: any) => p),
  },
}));

jest.mock("react-toastify/dist/ReactToastify.css", () => ({}), {
  virtual: true,
});

// ─── Import AFTER mocks ───────────────────────────────────────────────────────

import LoginForm from "@/app/(auth)/_components/LoginForm";

// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => jest.clearAllMocks());

describe("LoginForm — Unit Tests", () => {
  const setup = () => render(<LoginForm />);

  // TC-LOGIN-01
  it("TC-LOGIN-01: renders email field, password field, and login button", () => {
    setup();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /login/i })
    ).toBeInTheDocument();
  });

  // TC-LOGIN-02
  it("TC-LOGIN-02: shows validation error when submitting with empty fields", async () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    await waitFor(() => {
      const errors = document.querySelectorAll(".text-red-600, p[class*='red']");
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  // TC-LOGIN-03
  it("TC-LOGIN-03: toggles password visibility when Show/Hide clicked", async () => {
    setup();
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const toggleBtn = screen.getByRole("button", { name: /show/i });

    expect(passwordInput).toHaveAttribute("type", "password");
    await userEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute("type", "text");
    await userEvent.click(screen.getByRole("button", { name: /hide/i }));
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  // TC-LOGIN-04
  it("TC-LOGIN-04: redirects admin to /admin after successful login", async () => {
    mockHandleLogin.mockResolvedValue({
      success: true,
      data: { token: "admin-token", role: "admin" },
    });

    setup();
    await userEvent.type(screen.getByLabelText(/email/i), "admin@test.com");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "Password1!");
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        token: "admin-token",
        role: "admin",
      });
      expect(mockPush).toHaveBeenCalledWith("/admin");
    });
  });

  // TC-LOGIN-05
  it("TC-LOGIN-05: redirects regular user to /auth/dashboard after successful login", async () => {
    mockHandleLogin.mockResolvedValue({
      success: true,
      data: { token: "user-token", role: "user" },
    });

    setup();
    await userEvent.type(screen.getByLabelText(/email/i), "user@test.com");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "Password1!");
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/auth/dashboard");
    });
  });

  // TC-LOGIN-06
  it("TC-LOGIN-06: displays server error message when login fails", async () => {
    mockHandleLogin.mockResolvedValue({
      success: false,
      message: "Invalid email or password",
    });

    setup();
    await userEvent.type(screen.getByLabelText(/email/i), "wrong@test.com");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "WrongPass1!");
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Invalid email or password")
      ).toBeInTheDocument();
    });
  });

  // TC-LOGIN-07
  it("TC-LOGIN-07: calls signIn with google provider when Google button clicked", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: /google/i }));
    expect(mockSignIn).toHaveBeenCalledWith("google", {
      callbackUrl: "/auth/dashboard",
    });
  });

  // TC-LOGIN-08
  it("TC-LOGIN-08: calls signIn with facebook provider when Facebook button clicked", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: /facebook/i }));
    expect(mockSignIn).toHaveBeenCalledWith("facebook", {
      callbackUrl: "/auth/dashboard",
    });
  });

  // TC-LOGIN-09
  it("TC-LOGIN-09: login button is disabled and shows loading text while submitting", async () => {
    mockHandleLogin.mockReturnValue(new Promise(() => {})); // never resolves

    setup();
    await userEvent.type(screen.getByLabelText(/email/i), "user@test.com");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "Password1!");
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      const btn = screen.getByRole("button", { name: /logging in/i });
      expect(btn).toBeDisabled();
    });
  });

  // TC-LOGIN-10
  it("TC-LOGIN-10: Forget Password link navigates to /request-password-reset", () => {
    setup();
    const link = screen.getByRole("link", { name: /forget password/i });
    expect(link).toHaveAttribute("href", "/request-password-reset");
  });
});