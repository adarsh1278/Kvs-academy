import mongoose, { Schema } from 'mongoose';

const SubjectSchema = new Schema(
  {
    name: { type: String, required: true }, // e.g. "Mathematics"
    code: { type: String, required: true }, // e.g. "MATH101"
    type: { type: String, required: true, enum: ['Theory', 'Practical', 'Both'], default: 'Theory' },
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  },
  { timestamps: true }
);

SubjectSchema.index({ code: 1, class: 1 }, { unique: true });

export const Subject = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);
