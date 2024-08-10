import type { InferOutput } from 'valibot';
import { union } from 'valibot';

import { MainTagReferenceSchema } from './MainTagReferenceSchema';
import { ResourceTagReferenceSchema } from './ResourceTagReferenceSchema';

export const TagReferenceSchema = union([
  ...ResourceTagReferenceSchema.options,
  ...MainTagReferenceSchema.options,
]);

export type TagReferenceSchemaOutput = InferOutput<typeof TagReferenceSchema>;
