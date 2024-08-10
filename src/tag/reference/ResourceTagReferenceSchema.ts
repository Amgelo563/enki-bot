import type { InferOutput } from 'valibot';
import { object, optional, string, union } from 'valibot';

export const ResourceTagReferenceSchema = union([
  object({
    resource: string(),
    category: string(),
    tag: string(),

    variant: optional(string()),
  }),
  object({
    resource: string(),
    category: string(),
  }),
  object({
    resource: string(),
    tag: string(),
    variant: optional(string()),
  }),
]);

export type ResourceTagReferenceSchemaOutput = InferOutput<
  typeof ResourceTagReferenceSchema
>;
