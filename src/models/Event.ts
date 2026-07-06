import mongoose, { Schema } from 'mongoose';

const EventSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: { type: String },
    image: { type: String }, // Cloudinary URL
    isPublic: { type: Boolean, default: false }, // If true, visible on public site
  },
  { timestamps: true }
);

export const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);
