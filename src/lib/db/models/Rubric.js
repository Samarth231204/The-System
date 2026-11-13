import mongoose from 'mongoose';

// The XP design for one player: the parameters their work is judged on.
// Parameters are not fixed. They come from the player's goals and can be edited.
const parameterSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, maxlength: 40 },
    label: { type: String, required: true, maxlength: 40 },
    weight: { type: Number, required: true, min: 1, max: 5 },
    description: { type: String, default: '', maxlength: 240 },
  },
  { _id: false }
);

const rubricSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    source: { type: String, enum: ['ai', 'local', 'manual'], default: 'local' },
    parameters: { type: [parameterSchema], default: [] },
  },
  { timestamps: true }
);

export const Rubric = mongoose.models.Rubric || mongoose.model('Rubric', rubricSchema);
