import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const mockHandleResetPassword = jest.fn();
jest.mock("@/lib/actions/auth-action", () => ({
  handleResetPassword: (...args: any[]) => mockHandleResetPassword(...args),
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

import ResetPasswordForm from "@/app/(auth)/_components/ResetPasswordForm";
import { AppToast } from "@/lib/toast";

// ─────────────────────────────────────────────────────────────────────────────

const TEST_TOKEN = "test-reset-token-abc123";

beforeEach(() => jest.clearAllMocks());

describe("ResetPasswordForm — Unit Tests", () => {
  const setup = (token = TEST_TOKEN) => render(<ResetPasswordForm token={token} />);

  // TC-RESET-01
  // FIX: Use exact label strings — /new password/i matched both "New Password"
  //      and "Confirm New Password", causing "Found multiple elements" error.
  it("TC-RESET-01: renders New Password field, Confirm New Password field, and Reset Password button", () => {
    setup();
    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm New Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reset password/i })
    ).toBeInTheDocument();
  });

  // TC-RESET-02
  it("TC-RESET-02: renders Back to Login and Request another reset email links with correct hrefs", () => {
    setup();
    expect(screen.getByRole("link", { name: /back to login/i })).toHaveAttribute(
      "href",
      "/login"
    );
    expect(
      screen.getByRole("link", { name: /request another reset email/i })
    ).toHaveAttribute("href", "/request-password-reset");
  });

  // TC-RESET-03
  // FIX: Both fields show the same error message on empty submit — use getAllByText
  //      instead of getByText to handle multiple matching <p> elements.
  it("TC-RESET-03: shows validation error when submitting with both fields empty", async () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
    await waitFor(() => {
      const errors = screen.getAllByText(/password must be at least 6 characters long/i);
      expect(errors.length).toBeGreaterThanOrEqual(1);
    });
  });

  // TC-RESET-04
  // FIX: Same as TC-RESET-03 — two matching error <p> tags rendered simultaneously.
  //      Also switched to exact label strings for getByLabelText.
  it("TC-RESET-04: shows validation error when password is shorter than 6 characters", async () => {
    setup();
    await userEvent.type(screen.getByLabelText("New Password"), "abc");
    await userEvent.type(screen.getByLabelText("Confirm New Password"), "abc");
    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
    await waitFor(() => {
      const errors = screen.getAllByText(/password must be at least 6 characters long/i);
      expect(errors.length).toBeGreaterThanOrEqual(1);
    });
  });

  // TC-RESET-05
  it("TC-RESET-05: shows 'Passwords do not match' error when passwords differ", async () => {
    setup();
    await userEvent.type(screen.getByLabelText("New Password"), "Password1!");
    await userEvent.type(screen.getByLabelText("Confirm New Password"), "Different1!");
    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  // TC-RESET-06
  it("TC-RESET-06: calls handleResetPassword with the correct token and password on valid submit", async () => {
    mockHandleResetPassword.mockResolvedValue(undefined);
    setup();
    await userEvent.type(screen.getByLabelText("New Password"), "NewPass1!");
    await userEvent.type(screen.getByLabelText("Confirm New Password"), "NewPass1!");
    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
    await waitFor(() => {
      expect(mockHandleResetPassword).toHaveBeenCalledWith(TEST_TOKEN, "NewPass1!");
    });
  });

  // TC-RESET-07
  it("TC-RESET-07: calls AppToast.promise with correct loading/success/error messages on submit", async () => {
    mockHandleResetPassword.mockResolvedValue(undefined);
    setup();
    await userEvent.type(screen.getByLabelText("New Password"), "NewPass1!");
    await userEvent.type(screen.getByLabelText("Confirm New Password"), "NewPass1!");
    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
    await waitFor(() => {
      expect(AppToast.promise).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          loading: "Resetting your password...",
          success: "Password reset successfully",
          error: "Failed to reset password",
        })
      );
    });
  });

  // TC-RESET-08
  // FIX: Removed jest.useFakeTimers() — it blocks userEvent which relies on real
  //      timers internally, causing a 5s timeout. Instead, await a real 1000ms
  //      promise to cover the component's internal 900ms setTimeout.
  it("TC-RESET-08: redirects to /login after successful password reset", async () => {
    mockHandleResetPassword.mockResolvedValue(undefined);
    setup();
    await userEvent.type(screen.getByLabelText("New Password"), "NewPass1!");
    await userEvent.type(screen.getByLabelText("Confirm New Password"), "NewPass1!");
    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
    await waitFor(() => expect(mockHandleResetPassword).toHaveBeenCalled());
    await new Promise((r) => setTimeout(r, 1000));
    expect(mockReplace).toHaveBeenCalledWith("/login");
  }, 10000);

  // TC-RESET-09
  // FIX: Added 10s timeout — userEvent.type is slow; default 5s was too short.
  it("TC-RESET-09: shows AppToast.error when handleResetPassword throws an unexpected error", async () => {
    mockHandleResetPassword.mockRejectedValue(new Error("Network failure"));
    (AppToast.promise as jest.Mock).mockImplementation((p: any) => p);
    setup();
    await userEvent.type(screen.getByLabelText("New Password"), "NewPass1!");
    await userEvent.type(screen.getByLabelText("Confirm New Password"), "NewPass1!");
    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
    await waitFor(() => {
      expect(AppToast.error).toHaveBeenCalledWith("Network failure");
    });
  }, 10000);

  // TC-RESET-10
  // FIX: Added 10s timeout for same reason as TC-RESET-09.
  it("TC-RESET-10: button is disabled and shows loading text while form is submitting", async () => {
    mockHandleResetPassword.mockReturnValue(new Promise(() => {})); // never resolves
    (AppToast.promise as jest.Mock).mockImplementation((p: any) => p);
    setup();
    await userEvent.type(screen.getByLabelText("New Password"), "NewPass1!");
    await userEvent.type(screen.getByLabelText("Confirm New Password"), "NewPass1!");
    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
    await waitFor(() => {
      const btn = screen.getByRole("button", { name: /updating password/i });
      expect(btn).toBeDisabled();
    });
  }, 10000);

  // TC-RESET-11
  // FIX: Added 10s timeout for same reason as TC-RESET-09.
  it("TC-RESET-11: does not call handleResetPassword when only password field is filled", async () => {
    setup();
    await userEvent.type(screen.getByLabelText("New Password"), "NewPass1!");
    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
    await waitFor(() => {
      expect(mockHandleResetPassword).not.toHaveBeenCalled();
    });
  }, 10000);

  // TC-RESET-12
  // FIX: Added 10s timeout for same reason as TC-RESET-09.
  it("TC-RESET-12: does not redirect when handleResetPassword fails", async () => {
    mockHandleResetPassword.mockRejectedValue(new Error("Token expired"));
    (AppToast.promise as jest.Mock).mockImplementation((p: any) => p);
    setup();
    await userEvent.type(screen.getByLabelText("New Password"), "NewPass1!");
    await userEvent.type(screen.getByLabelText("Confirm New Password"), "NewPass1!");
    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
    await waitFor(() => expect(AppToast.error).toHaveBeenCalled());
    expect(mockReplace).not.toHaveBeenCalled();
  }, 10000);
});