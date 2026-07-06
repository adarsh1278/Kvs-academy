import mongoose, { Schema } from 'mongoose';

const SubmissionSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  submittedAt: { type: Date, required: true, default: Date.now },
  fileUrl: { type: String, required: true }, // Student's completed work
  remarks: { type: String, default: '' },
});

const HomeworkSchema = new Schema(
  {
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    section: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true },
    attachmentUrl: { type: String }, // Teacher's assignment worksheet/attachment
    teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Issuing teacher
    submissions: [SubmissionSchema],
  },
  { timestamps: true }
);

export const Homework = mongoose.models.Homework || mongoose.model('Homework', HomeworkSchema);
