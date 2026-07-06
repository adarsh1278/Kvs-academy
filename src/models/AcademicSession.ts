import mongoose, { Schema } from 'mongoose';

const AcademicSessionSchema = new Schema(
  {
    name: { type: String, required: true, unique: true }, // e.g. "2026-2027"
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isCurrent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const AcademicSession =
  mongoose.models.AcademicSession ||
  mongoose.model('AcademicSession', AcademicSessionSchema);
