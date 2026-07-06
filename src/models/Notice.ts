import mongoose, { Schema } from 'mongoose';

const NoticeSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    target: {
      type: String,
      required: true,
      enum: ['all', 'teachers', 'students', 'class'],
      default: 'all',
    },
    targetClass: { type: Schema.Types.ObjectId, ref: 'Class' }, // If target === 'class'
    expiryDate: { type: Date, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Notice = mongoose.models.Notice || mongoose.model('Notice', NoticeSchema);
