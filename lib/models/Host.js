// ==========================================
// FILE: lib/models/Host.js
// Host accounts — created by Super Admin from the admin panel.
// Each host has a game scope (BGMI or FREEFIRE), their own login
// credentials, and a commission rate tracked per match.
// ==========================================
import mongoose from 'mongoose';
import crypto from 'crypto';

function hashPassword(plain) {
  return crypto.createHash('sha256').update(plain).digest('hex');
}

const hostSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    // BGMI or FREEFIRE — a host only manages one game
    scope: { type: String, enum: ['BGMI', 'FREEFIRE'], required: true },
    // Commission % per match (e.g. 5 = 5% of platform cut goes to this host)
    commissionPct: { type: Number, default: 5, min: 0, max: 100 },
    isActive: { type: Boolean, default: true },
    // Running tally — updated when admin processes payouts
    totalEarned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Static helper so callers never touch the hash algorithm directly
hostSchema.statics.hashPassword = hashPassword;
hostSchema.methods.verifyPassword = function (plain) {
  return this.passwordHash === hashPassword(plain);
};

export default mongoose.models.Host || mongoose.model('Host', hostSchema);
