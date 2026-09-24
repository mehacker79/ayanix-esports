# Ayanix Esports — Clean Rebuild

## 1. What changed in this refactor
- **`app/page.js`** is now a thin router + auth gate. The old duplicate `LobbiesView`/`TeamsView`
  placeholders that were inlined inside `page.js` are gone — everything lives in
  `app/components/*.js`, imported via the `@/` path alias.
- **`lib/tournamentConfig.js`** is the single source of truth for entry fees, platform cuts, and
  prize splits. Every number shown on Home, Lobbies, and the Admin dashboard is *computed* from
  this file, not hardcoded — change a fee once and it flows everywhere.
- **`app/admin/page.js` + `app/api/admin/auth/route.js`**: the super-admin password is checked
  **on the server only**, from `process.env.ADMIN_EMAIL` / `ADMIN_PASSWORD`, using a
  timing-safe comparison, and a session is stored in an `httpOnly` cookie. See the security
  note below for why this replaced the originally-requested hardcoded-in-the-client approach.
- Kept as-is (still needed, out of this refactor's scope): the Razorpay order/webhook routes,
  OTP route, tournament register/status routes, and the Mongoose models under `lib/models`.

## 2. Files to delete from your old repo before merging this in
Delete these — they're either duplicates, dev artifacts, or superseded by files above:
```
.next/                          # build cache, never commit or hand-merge this
app/api/admin/page.js           # a page.js sitting inside app/api is a routing conflict —
                                 # replaced by app/api/admin/auth/route.js
```

## 3. Login is now real (OTP via Nodemailer)
- `POST /api/auth/send-otp` emails a 6-digit code through your Gmail SMTP config and stores it
  server-side (`lib/otpStore.js`, in-memory, 5-minute expiry). **It no longer returns the OTP in
  the response** — the original route did, which meant anyone watching the network tab could
  read the code without ever opening their inbox. That's fixed.
- `POST /api/auth/verify-otp` checks the submitted code, creates/looks up the user in MongoDB,
  and sets a signed `httpOnly` session cookie (`lib/session.js`) — no JWT library needed, just
  HMAC-SHA256 signing with `AUTH_SECRET`.
- `GET /api/auth/session` lets the app check "am I logged in?" on page load, so a refresh
  doesn't bounce you back to the auth modal.
- `POST /api/auth/logout` clears the cookie. Wired to the "Log Out" button in the Edit Profile
  screen.
- The "Email & Password" tab in the auth modal is UI-only for now — there's no password field
  or hashing in the `User` model yet, so submitting it points you to OTP login instead of
  faking a successful login. Say the word if you want real password auth added (bcrypt +
  a password field on the User schema + a proper signup flow) — it's a bigger, separate change.
- In-memory OTP storage means the login only works reliably on a single always-on server
  process. If you deploy to serverless (e.g. Vercel functions), move `lib/otpStore.js` to a
  MongoDB collection with a TTL index instead — the function signatures are already isolated
  in that one file so the swap is small.
- Add `AUTH_SECRET` to your `.env.local` (see `.env.local.example`) — generate one with
  `openssl rand -hex 32`.

## 4. Setup
```bash
npm install
cp .env.local.example .env.local   # then fill in real values, see below
npm run dev
```

## 5. Important — rotate your credentials
The `.env.local` you shared contains a live-looking Gmail app password, a Razorpay **test**
key pair, and a MongoDB Atlas connection string with a real username/password embedded in the
URL. Because that file has now been shared outside your own machine, treat all three as
compromised and **rotate them** (new Gmail app password, new Mongo Atlas DB user password,
regenerate Razorpay keys) before going further. Never commit `.env.local` — it's in
`.gitignore` here — and never hardcode secrets directly in component files, since anything in
a `"use client"` file ships to every visitor's browser.

## 6. Important — India's online gaming law now covers this exact business model
The **Promotion and Regulation of Online Gaming Act, 2025**, together with its 2026 Rules, came
into force on **1 May 2026**. It bans "online money games" outright (any game — skill or chance
— played by paying an entry fee with the expectation of winning money), with penalties up to
₹1 crore and imprisonment for offering one. It carves out **e-sports** as a separate, permitted
category — paid tournament entry with performance-based cash prizes, no wagering by
participants or spectators — but only if the game is **registered with the Online Gaming
Authority of India (OGAI)** and meets its conditions (skill-only outcomes, KYC/age
verification, etc.).

A paid-entry BGMI/Free Fire squad tournament with a cash prize pool — exactly what this app is
built for — is the kind of platform this law is aimed at regulating. Before you launch or take
real payments:
- Confirm your tournament format and registration status with the OGAI (or a lawyer) so it's
  classified as e-sports rather than an unregistered money game.
- Build in the KYC/age-verification, deposit-limit, and self-exclusion features the Rules
  require for registered platforms.
- I'm not a lawyer and this isn't legal advice — treat this as a pointer to check before you
  process real entry fees, not a compliance sign-off.

## 7. Directory structure
```
e-sport/
├── app/
│   ├── admin/page.js
│   ├── api/
│   │   ├── admin/{auth,logout,get-active-teams,calculate-leaderboard}/route.js
│   │   ├── auth/{send-otp,verify-otp,session,logout}/route.js
│   │   ├── registration/create-order/route.js
│   │   ├── tournament/{register,status}/route.js
│   │   └── webhook/razorpay/route.js
│   ├── components/{HomeView,LobbiesView,TeamsView,ProfileView}.js
│   ├── layout.js
│   ├── page.js
│   └── globals.css
├── lib/
│   ├── tournamentConfig.js
│   ├── otpStore.js
│   ├── session.js
│   ├── db.js
│   └── models/{User,Tournament}.js
├── scripts/seed-tournament.js
├── public/logo.png
├── .env.local.example
├── tailwind.config.js
├── postcss.config.mjs
├── next.config.mjs
└── jsconfig.json
```
