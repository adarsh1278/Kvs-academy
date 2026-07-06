import mongoose, { Schema } from 'mongoose';

const AttendanceRecordSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Late', 'Half Day', 'Leave'], required: true },
  remarks: { type: String, default: '' },
});

const AttendanceSchema = new Schema(
  {
    date: { type: Date, required: true }, // Normalized to midnight UTC
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    section: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    records: [AttendanceRecordSchema],
    markedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Single daily attendance per class/section
AttendanceSchema.index({ date: 1, class: 1, section: 1 }, { unique: true });

export const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
