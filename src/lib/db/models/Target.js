import mongoose from 'mongoose';

// A boss target: something the player wants to achieve before a deadline.
// Claiming it spends XP from the balance. Linked quests show progress.
const targetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    cost: { type: Number, required: true, min: 1, max: 100000 },
    deadline: { type: Date, required: true },
    taskIds: { type: [mongoose.Schema.Types.ObjectId], default: [] },
    claimedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Target = mongoose.models.Target || mongoose.model('Target', targetSchema);
