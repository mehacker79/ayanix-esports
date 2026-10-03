import mongoose from 'mongoose';
import crypto from 'crypto';

/** Generates a unique 8-char alphanumeric match code, e.g. "AX7K2M9P" */
function generateMatchCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

const playerSchema = new mongoose.Schema({
  ign: { type: String, required: true },
  charId: { type: String, required: true },
});

const squadSchema = new mongoose.Schema(
  {
    squadName: { type: String, required: true },
    captainId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    captainEmail: String,
    members: [playerSchema],
    paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' },
    razorpayOrderId: String,
    razorpayPaymentId: String,
  },
  { timestamps: true }
);

// One result entry per squad after the match ends
const resultSchema = new mongoose.Schema({
  squadName: { type: String, required: true },
  rank: { type: Number, required: true },
  kills: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
});

const tournamentSchema = new mongoose.Schema(
  {
    game: { type: String, enum: ['BGMI', 'FREEFIRE'], required: true },
    title: { type: String, required: true },
    mapType: String,
    entryFee: { type: Number, required: true },
    prizePool: { type: Number, required: true },
    slotsTotal: { type: Number, required: true },
    status: { type: String, enum: ['UPCOMING', 'LIVE', 'COMPLETED'], default: 'UPCOMING' },
    matchStartAt: Date,
    confirmedSquads: [squadSchema],

    // ── Host System fields ──────────────────────────────────────────────────
    /** Unique internal code shown to registered players (e.g. "AX7K2M9P").
     *  Prevents cross-match mix-ups when multiple hosts run simultaneously. */
    matchCode: {
      type: String,
      default: generateMatchCode,
      unique: true,
      uppercase: true,
    },
    /** The host account assigned to manage this match */
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'Host', default: null },

    /** Game Room credentials — entered by the host via "Publish" */
    roomId: { type: String, default: '' },
    roomPassword: { type: String, default: '' },
    /** Timestamp when host clicked "Publish".  Players see credentials
     *  10-15 min before matchStartAt (we gate on matchStartAt - 10 min). */
    credentialsPublishedAt: { type: Date, default: null },

    /** Results submitted by host after match ends */
    results: [resultSchema],
    resultsSubmittedAt: { type: Date, default: null },
    // ── /Host System fields ─────────────────────────────────────────────────
  },
  { timestamps: true }
);

// slotsFilled is always DERIVED from actual squads — never a stale stored number
tournamentSchema.virtual('slotsFilled').get(function () {
  return this.confirmedSquads.length;
});
tournamentSchema.set('toJSON', { virtuals: true });
tournamentSchema.set('toObject', { virtuals: true });

export default mongoose.models.Tournament || mongoose.model('Tournament', tournamentSchema);