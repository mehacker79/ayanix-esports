import mongoose from 'mongoose';

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