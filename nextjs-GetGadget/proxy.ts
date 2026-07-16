import { NextRequest, NextResponse } from "next/server";
import { getAuthToken, getUserData } from "@/lib/cookie";

const publicRoutes = [
  "/login",
  "/register",
  "/forget-password",
  "/reset-password",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getAuthToken();
  const user = token ? await getUserData() : null;

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isAdminRoute = pathname.startsWith("/admin");
  const isUserRoute = pathname.startsWith("/auth");

  // 🔐 Not logged in → redirect to login
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 👤 Logged in users
  if (token && user) {
    // Admin trying to access user route
    if (isUserRoute && user.role !== "user") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // User trying to access admin route
    if (isAdminRoute && user.role !== "admin") {
      return NextResponse.redirect(new URL("/auth/dashboard", request.url));
    }

    // Logged in user visiting login/register
    if (isPublicRoute) {
      if (user.role === "admin") {
        return NextResponse.redirect(
          new URL("/admin/dashboard", request.url)
        );
      }

      return NextResponse.redirect(
        new URL("/auth/dashboard", request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/auth/:path*",
    "/login",
    "/register",
    "/forget-password",
    "/reset-password",
  ],
};