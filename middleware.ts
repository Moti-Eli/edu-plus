import { updateSession } from "@/lib/supabase/proxy";
import { type NextRequest, NextResponse } from "next/server";

// דפים ציבוריים שלא צריכים בדיקת התחברות
const publicRoutes = [
  "/",
  "/terms",
  "/privacy", 
  "/accessibility",
  "/programs",
  "/auth/login",
  "/auth/forgot-password",
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // אם זה דף ציבורי - תן לעבור
  if (publicRoutes.some(route => path === route || path.startsWith(route + "/"))) {
    return NextResponse.next();
  }
  
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};