import mongoose from 'mongoose';

// A unit of work: a daily quest, a side quest, or a quick note.
// XP fields arrive with the judge in Phase 6.
const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    kind: { type: String, enum: ['quest', 'side', 'note'], default: 'quest' },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    details: { type: String, default: '', trim: true, maxlength: 1000 },
    dueAt: { type: Date, default: null },
    status: { type: String, enum: ['open', 'done'], default: 'open' },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

taskSchema.index({ userId: 1, status: 1, dueAt: 1 });

export const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);
