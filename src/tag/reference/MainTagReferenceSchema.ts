import type { InferOutput } from 'valibot';
import { object, optional, string, union } from 'valibot';

export const MainTagReferenceSchema = union([
  object({
    category: string(),
    tag: string(),

    variant: optional(string()),
  }),
  object({
    category: string(),
  }),
]);

export type MainTagReferenceSchemaOutput = InferOutput<
  typeof MainTagReferenceSchema
>;
