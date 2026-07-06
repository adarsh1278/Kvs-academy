import mongoose, { Schema } from 'mongoose';
import './Class';
import './Section';

const AcademicHistorySchema = new Schema({
  schoolName: { type: String },
  lastClass: { type: String },
  percentage: { type: Number },
  year: { type: String },
});

const DocumentSchema = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
});

const StudentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    admissionNo: { type: String, required: true, unique: true },
    rollNo: { type: String, required: true },
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    section: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
    parentName: { type: String, required: true },
    parentPhone: { type: String, required: true },
    parentEmail: { type: String },
    emergencyContact: { type: String, required: true },
    address: { type: String, required: true },
    aadhaarNo: { type: String },
    profileImage: { type: String }, // Cloudinary URL
    documents: [DocumentSchema], // Array of uploaded document credentials
    transportDetails: { type: String, default: '' },
    hostelDetails: { type: String, default: '' },
    academicHistory: [AcademicHistorySchema],
  },
  { timestamps: true }
);

export const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);
