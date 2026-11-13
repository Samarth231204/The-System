import mongoose from 'mongoose';

// Remembers when a player dismissed an alert, so it stays hidden for a while.
const alertSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    key: { type: String, required: true, maxlength: 80 },
    dismissedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

alertSchema.index({ userId: 1, key: 1 }, { unique: true });

export const Alert = mongoose.models.Alert || mongoose.model('Alert', alertSchema);
