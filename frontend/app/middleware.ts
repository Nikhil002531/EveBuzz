
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"; // or use jwt-decode if using only access tokens

const PUBLIC_PATHS = ["/login", "/register", "/"]; // Allow unauthenticated users

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();

  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const decoded = jwt.decode(token) as any;

    // Example: Protect /add-event for only staff
    if (pathname.startsWith("/form") && !decoded?.is_staff) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
