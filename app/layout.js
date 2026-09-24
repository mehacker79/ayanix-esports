// ==========================================
// FILE: app/layout.js — Global HTML shell, metadata, theme wrapper
// ==========================================
import { Rajdhani, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

export const metadata = {
  title: "Ayanix Esports — BGMI & Free Fire Tournaments",
  description:
    "Compete in paid BGMI and Free Fire MAX squad tournaments. Register your squad, track live slots, and climb the leaderboard.",
  icons: {
    icon: "/logo.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0b0f19",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0b0f19] text-white antialiased min-h-screen">
        {children}
        {/* Loaded once, globally, so the squad-registration checkout in
            app/page.js can call window.Razorpay without a per-page script tag. */}
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
