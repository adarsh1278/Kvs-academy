import mongoose, { Schema } from 'mongoose';

const PeriodSchema = new Schema({
  subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // The teacher User teaching this period
  startTime: { type: String, required: true }, // e.g. "08:30"
  endTime: { type: String, required: true }, // e.g. "09:15"
  roomNumber: { type: String },
});

const TimetableSchema = new Schema(
  {
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    section: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    day: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    periods: [PeriodSchema],
  },
  { timestamps: true }
);

TimetableSchema.index({ class: 1, section: 1, day: 1 }, { unique: true });

export const Timetable = mongoose.models.Timetable || mongoose.model('Timetable', TimetableSchema);
