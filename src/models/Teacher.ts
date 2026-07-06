import mongoose, { Schema } from 'mongoose';
import './Subject';
import './Class';

const TeacherSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    teacherId: { type: String, required: true, unique: true },
    qualification: { type: String, required: true },
    experience: { type: String, required: true }, // e.g. "5 Years"
    subjects: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
    assignedClasses: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
    profileImage: { type: String }, // Cloudinary URL
    salary: { type: Number, required: true },
    employmentStatus: { type: String, enum: ['Active', 'Resigned', 'Suspended'], default: 'Active' },
    joiningDate: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

export const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', TeacherSchema);
