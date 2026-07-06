import mongoose, { Schema } from 'mongoose';

const ClassSchema = new Schema(
  {
    name: { type: String, required: true }, // e.g. "Class 10" or "Grade 1"
    academicSession: { type: Schema.Types.ObjectId, ref: 'AcademicSession', required: true },
  },
  { timestamps: true }
);

// Compounding unique name + session to prevent duplicates in the same school year
ClassSchema.index({ name: 1, academicSession: 1 }, { unique: true });

export const Class = mongoose.models.Class || mongoose.model('Class', ClassSchema);
