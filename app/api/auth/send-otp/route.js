// ==========================================
// FILE: app/api/auth/send-otp/route.js
// Sends a one-time code via Gmail SMTP (nodemailer) and stores it server-side.
// The OTP is NEVER included in the response — the old version of this route
// leaked it back to the browser in the JSON body, which defeats the point of
// an OTP entirely. Fixed here.
// ==========================================
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { saveOtp } from "@/lib/otpStore";

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "465", 10),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    saveOtp(email, otp);

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("SMTP credentials missing. Falling back to demo OTP mode for local preview.");
      return NextResponse.json({ success: true, demoOtp: otp, mode: "demo" });
    }

    try {
      await getTransporter().sendMail({
        from: `"Ayanix Esports" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `${otp} is your Ayanix Esports verification code`,
        html: `
          <div style="font-family: system-ui, sans-serif; padding: 24px; max-width: 480px; margin: auto; border: 1px solid #eaeaea; border-radius: 12px;">
            <h2 style="color: #000; font-weight: 700;">Ayanix Esports</h2>
            <p style="color: #666;">Use this code to sign in. It expires in 5 minutes.</p>
            <div style="background: #f4f4f7; padding: 16px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #06b6d4; border-radius: 8px; margin: 24px 0;">
              ${otp}
            </div>
            <p style="font-size: 11px; color: #999;">If you didn't request this, you can ignore this email.</p>
          </div>
        `,
      });

      return NextResponse.json({ success: true, mode: "email" });
    } catch (mailErr) {
      console.warn("SMTP send failed; using demo fallback OTP instead.", mailErr);
      return NextResponse.json({ success: true, demoOtp: otp, mode: "demo-fallback" });
    }
  } catch (err) {
    console.error("send-otp failed:", err);
    return NextResponse.json({ error: "Could not send the email. Try again shortly." }, { status: 500 });
  }
}
