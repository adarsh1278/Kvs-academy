import mongoose, { Schema } from 'mongoose';

const EnquirySchema = new Schema(
  {
    studentName: { type: String, required: true },
    parentName: { type: String, required: true },
    parentPhone: { type: String, required: true },
    parentEmail: { type: String },
    dob: { type: Date, required: true },
    gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
    classApplyingFor: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    previousSchool: { type: String, default: '' },
    address: { type: String, required: true },
    documents: [
      {
        name: { type: String },
        url: { type: String },
      },
    ],
    photograph: { type: String }, // Cloudinary URL
    status: {
      type: String,
      required: true,
      enum: ['pending', 'approved', 'rejected', 'follow_up', 'converted'],
      default: 'pending',
    },
    followUpNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Enquiry = mongoose.models.Enquiry || mongoose.model('Enquiry', EnquirySchema);
