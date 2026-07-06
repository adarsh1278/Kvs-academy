import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ['super_admin', 'admin', 'receptionist', 'teacher', 'student'],
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    permissions: {
      type: [String], // e.g. ['admissions', 'fees', 'attendance', 'website'] for sub-admins/receptionists
      default: [],
    },
    // Optional staff details directly on user for receptionists / sub-admins
    employeeId: { type: String },
    phone: { type: String, trim: true },
    designation: { type: String },
    department: { type: String },
  },
  { timestamps: true }
);

UserSchema.index({ phone: 1 }, { unique: true, sparse: true });

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
