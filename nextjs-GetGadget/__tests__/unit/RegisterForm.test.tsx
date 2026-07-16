import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const mockHandleRegister = jest.fn();
jest.mock("@/lib/actions/auth-action", () => ({
  handleRegister: (...args: any[]) => mockHandleRegister(...args),
}));

// Key fix: AppToast.promise must await the promise and return its result
jest.mock("@/lib/toast", () => ({
  AppToast: {
    success: jest.fn(),
    error: jest.fn(),
    promise: jest.fn(async (p: any) => await p),
  },
}));

// ─── Import AFTER mocks ───────────────────────────────────────────────────────

import RegisterForm from "@/app/(auth)/_components/RegisterForm";

// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => jest.clearAllMocks());

// Helper: fill and submit the form
const fillAndSubmit = async (
  email: string,
  password: string,
  confirmPassword: string
) => {
  await userEvent.type(screen.getByLabelText(/email/i), email);
  await userEvent.type(screen.getByLabelText(/^password$/i), password);
  await userEvent.type(screen.getByLabelText(/confirm password/i), confirmPassword);
  fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
};

describe("RegisterForm — Unit Tests", () => {
  const setup = () => render(<RegisterForm />);

  // TC-REG-01
  it("TC-REG-01: renders email, password, confirmPassword and sign up button", () => {
    setup();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  // TC-REG-02
  it("TC-REG-02: shows validation errors when submitting empty form", async () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    await waitFor(() => {
      const errors = document.querySelectorAll(".text-red-600, p[class*='red']");
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  // TC-REG-03
  it("TC-REG-03: shows error when passwords do not match", async () => {
    setup();
    await fillAndSubmit("test@test.com", "Password1!", "Different1!");
    await waitFor(() => {
      const errors = document.querySelectorAll(".text-red-600, p[class*='red']");
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  // TC-REG-04
  it("TC-REG-04: toggles password field visibility when eye icon clicked", async () => {
    setup();
    const passwordInput = screen.getAllByPlaceholderText("••••••••••")[0];
    const showButtons = screen.getAllByAltText(/show/i);
    const toggleBtn = showButtons[0].closest("button")!;

    expect(passwordInput).toHaveAttribute("type", "password");
    await userEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute("type", "text");
  });

  // TC-REG-05
  it("TC-REG-05: toggles confirm password field visibility independently", async () => {
    setup();
    const confirmInput = screen.getAllByPlaceholderText("••••••••••")[1];
    const showButtons = screen.getAllByAltText(/show/i);
    const confirmToggle = showButtons[1].closest("button")!;

    expect(confirmInput).toHaveAttribute("type", "password");
    await userEvent.click(confirmToggle);
    expect(confirmInput).toHaveAttribute("type", "text");
  });

  // TC-REG-06
  it("TC-REG-06: calls handleRegister with correct values on submit", async () => {
    mockHandleRegister.mockResolvedValue({ success: true });
    setup();

    await fillAndSubmit("new@test.com", "Password1!", "Password1!");

    await waitFor(() => {
      expect(mockHandleRegister).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "new@test.com",
          password: "Password1!",
          confirmPassword: "Password1!",
        })
      );
    }, { timeout: 3000 });
  });

  // TC-REG-07
  it("TC-REG-07: redirects to /login after successful registration", async () => {
    mockHandleRegister.mockResolvedValue({ success: true });
    setup();

    await fillAndSubmit("new@test.com", "Password1!", "Password1!");

    await waitFor(() => {
      expect(mockHandleRegister).toHaveBeenCalled();
    }, { timeout: 3000 });

    // Advance the 900ms setTimeout in the component
    await act(async () => {
      await new Promise((r) => setTimeout(r, 1000));
    });

    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  // TC-REG-08
  it("TC-REG-08: displays server error message when registration fails", async () => {
    mockHandleRegister.mockResolvedValue({
      success: false,
      message: "Email already in use",
    });
    setup();

    await fillAndSubmit("dup@test.com", "Password1!", "Password1!");

    await waitFor(() => {
      expect(screen.getByText("Email already in use")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  // TC-REG-09
  it("TC-REG-09: sign up button is disabled and shows loading text while submitting", async () => {
    // Never resolves — keeps the loading state active
    mockHandleRegister.mockReturnValue(new Promise(() => {}));
    setup();

    await userEvent.type(screen.getByLabelText(/email/i), "new@test.com");
    await userEvent.type(screen.getByLabelText(/^password$/i), "Password1!");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "Password1!");
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      const btn = screen.getByRole("button", { name: /creating user/i });
      expect(btn).toBeDisabled();
    }, { timeout: 3000 });
  });

  // TC-REG-10
  it("TC-REG-10: Login here link points to /login", () => {
    setup();
    const link = screen.getByRole("link", { name: /login here/i });
    expect(link).toHaveAttribute("href", "/login");
  });
});