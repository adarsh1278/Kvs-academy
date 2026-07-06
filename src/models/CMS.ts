import mongoose, { Schema } from 'mongoose';

const CMSSchema = new Schema(
  {
    key: { type: String, required: true, unique: true }, // e.g. "home_hero", "about_us", "principal_message", "faqs"
    value: { type: Schema.Types.Mixed, required: true }, // JSON data representation of page sections
  },
  { timestamps: true }
);

export const CMS = mongoose.models.CMS || mongoose.model('CMS', CMSSchema);
