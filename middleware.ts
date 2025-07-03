import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get("galileo_auth")

  // Parse auth data
  let authData = null
  if (authCookie) {
    try {
      authData = JSON.parse(authCookie.value)
    } catch {
      // Invalid cookie
    }
  }

  // Check if user is trying to access admin panel
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!authData || !authData.isAdmin) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    // Allow admin access to admin panel
    return NextResponse.next()
  }

  // Check if user is trying to access the main app (client search)
  if (request.nextUrl.pathname === "/") {
    if (!authData) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    // Allow both admins and regular users to access client search
    return NextResponse.next()
  }

  // Check if user is trying to access US Banks dashboard
  if (request.nextUrl.pathname === "/us-banks") {
    if (!authData) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    // Allow both admins and regular users to access US Banks
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/admin/:path*", "/us-banks"],
}
