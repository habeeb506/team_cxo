import mongoose from 'mongoose';

import { auditableSchemaPlugin } from './plugins/auditableSchema.plugin.js';

const { Schema } = mongoose;

/**
 * news_bulletins -- company announcements shown in the Dashboard's News
 * Bulletin panel (right-hand column). `description` holds the full
 * text; truncating it to a 3-line preview with a "View more" modal is
 * a display concern handled entirely client-side (CSS line-clamp),
 * not something this API does -- the full description is always
 * returned so the modal never needs a second request.
 */
const newsBulletinSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 5000,
    },
    // Optional "read more" / source link. Free-form on purpose -- not
    // every bulletin links out to something.
    link: {
      type: String,
      trim: true,
      default: '',
    },
    publishedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true },
);

newsBulletinSchema.plugin(auditableSchemaPlugin, { userRef: 'User' });

// Primary read pattern: latest bulletins first, paginated for the
// panel's lazy-loading scroll.
newsBulletinSchema.index({ publishedAt: -1 });
newsBulletinSchema.index({ title: 'text' });

export default mongoose.model('NewsBulletin', newsBulletinSchema, 'news_bulletins');
