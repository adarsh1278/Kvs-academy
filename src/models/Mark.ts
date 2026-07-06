import mongoose, { Schema } from 'mongoose';

const MarkSchema = new Schema(
  {
    exam: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    marksObtained: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    remarks: { type: String },
  },
  { timestamps: true }
);

// Ensure a student has only one marks entry per exam per subject
MarkSchema.index({ exam: 1, student: 1, subject: 1 }, { unique: true });

export const Mark = mongoose.models.Mark || mongoose.model('Mark', MarkSchema);
