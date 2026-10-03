// ==========================================
// FILE: lib/models/ChatMessage.js
// In-match live chat between players and the host.
// Messages are scoped to a tournament ID so each match
// has its own isolated chat channel.
// ==========================================
import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      required: true,
      index: true,
    },
    // 'player' | 'host'
    senderRole: { type: String, enum: ['player', 'host'], required: true },
    // Email or display name
    senderLabel: { type: String, required: true },
    text: { type: String, required: true, maxlength: 500, trim: true },
    // For moderation — host can flag a message as a cheat report
    isCheatReport: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// We'll poll the last 50 messages; createdAt index speeds that up
chatMessageSchema.index({ tournamentId: 1, createdAt: -1 });

export default mongoose.models.ChatMessage || mongoose.model('ChatMessage', chatMessageSchema);
