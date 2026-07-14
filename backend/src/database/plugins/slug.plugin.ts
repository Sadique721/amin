import { Schema } from 'mongoose';
import { slugify } from '@/utils/slugify';

export interface SlugPluginOptions {
  sourceField?: string;
  slugField?: string;
}

export const slugPlugin = (schema: Schema, options: SlugPluginOptions = {}) => {
  const sourceField = options.sourceField || 'name';
  const slugField = options.slugField || 'slug';

  // Ensure slug field exists in schema
  if (!schema.path(slugField)) {
    schema.add({
      [slugField]: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
      },
    });
  }

  schema.pre('validate', function (next) {
    const doc = this as any;
    if (doc.isModified(sourceField) || !doc[slugField]) {
      if (doc[sourceField]) {
        doc[slugField] = slugify(doc[sourceField]);
      }
    }
    next();
  });
};
