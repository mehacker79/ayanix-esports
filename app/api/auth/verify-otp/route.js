// ==========================================
// FILE: app/api/auth/verify-otp/route.js
// Verifies the code against lib/otpStore, then logs the user in by setting
// an httpOnly signed session cookie (see lib/session.js).
// ==========================================
import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otpStore";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/session";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and code are required." }, { status: 400 });
    }

    const result = verifyOtp(email, otp);
    if (!result.ok) {
      return NextResponse.json({ error: result.reason }, { status: 401 });
    }

    // Create the user record on first login, otherwise just fetch it.
    // If MONGODB_URI isn't configured yet, we still let the login succeed —
    // the session works without a DB, you just won't have persisted profile data.
    try {
      await connectDB();
      await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        { $setOnInsert: { email: email.toLowerCase() } },
        { upsert: true, new: true }
      );
    } catch (dbErr) {
      console.warn("verify-otp: DB upsert skipped —", dbErr.message);
    }

    const token = createSessionToken(email);
    const response = NextResponse.json({ ok: true, email: email.toLowerCase() });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return response;
  } catch (err) {
    console.error("verify-otp failed:", err);
    return NextResponse.json({ error: "Something went wrong verifying your code." }, { status: 500 });
  }
}
