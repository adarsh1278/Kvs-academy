import mongoose, { Schema } from 'mongoose';

const ExamSchema = new Schema(
  {
    title: { type: String, required: true }, // e.g. "Quarterly Exam", "Weekly Math Quiz"
    type: {
      type: String,
      required: true,
      enum: ['Quarterly', 'Half-Yearly', 'Annual', 'Custom Test'],
    },
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    section: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject' }, // Optional (required for Custom Test)
    date: { type: Date, required: true, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Exam = mongoose.models.Exam || mongoose.model('Exam', ExamSchema);
