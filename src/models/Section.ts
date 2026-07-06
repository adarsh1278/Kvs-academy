import mongoose, { Schema } from 'mongoose';

const SectionSchema = new Schema(
  {
    name: { type: String, required: true }, // e.g. "A" or "B"
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    classTeacher: { type: Schema.Types.ObjectId, ref: 'User' }, // Reference to a teacher User
  },
  { timestamps: true }
);

SectionSchema.index({ name: 1, class: 1 }, { unique: true });

export const Section = mongoose.models.Section || mongoose.model('Section', SectionSchema);
