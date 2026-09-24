// ==========================================
// FILE: app/api/auth/session/route.js
// Lets the client ask "am I logged in?" on page load without exposing the
// session token itself — it's an httpOnly cookie the client can't read.
// ==========================================
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readSessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ loggedIn: false });
  }

  const session = readSessionToken(token);
  if (!session) {
    return NextResponse.json({ loggedIn: false });
  }

  return NextResponse.json({ loggedIn: true, email: session.email });
}
