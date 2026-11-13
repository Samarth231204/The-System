import mongoose from 'mongoose';

// One ledger line: XP earned for one parameter on one completed task.
const xpEventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
    parameterKey: { type: String, required: true },
    parameterLabel: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 10 },
    amount: { type: Number, required: true, min: 0 },
    reason: { type: String, default: '', maxlength: 240 },
    source: { type: String, enum: ['ai', 'local', 'override'], required: true },
  },
  { timestamps: true }
);

export const XpEvent = mongoose.models.XpEvent || mongoose.model('XpEvent', xpEventSchema);
