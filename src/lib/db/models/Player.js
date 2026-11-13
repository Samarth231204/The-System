import mongoose from 'mongoose';

// One player profile per account. The AI API key is never stored here:
// it lives only in the player's browser (see Phase 3).
const playerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    playerName: { type: String, default: '', trim: true, maxlength: 24 },
    purpose: { type: String, default: '', trim: true, maxlength: 160 },
    avatarId: { type: String, default: 'magician' },
    provider: { type: String, enum: ['gemini', 'claude', 'openai'], default: 'gemini' },
    goals: { type: String, default: '', maxlength: 1000 },
    onboardedAt: { type: Date, default: null },
    settings: {
      warningHours: { type: Number, default: 2, min: 1, max: 48 },
      stagnationDays: { type: Number, default: 3, min: 1, max: 30 },
    },
  },
  { timestamps: true }
);

export const Player = mongoose.models.Player || mongoose.model('Player', playerSchema);
