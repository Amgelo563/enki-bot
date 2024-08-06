import type { InferOutput } from 'valibot';
import { object, optional, string, union } from 'valibot';

export const ResourceTagReferenceSchema = union([
  object({
    resourceCategory: string(),

    resource: string(),
    category: string(),
  }),
  object({
    resourceCategory: string(),

    resource: string(),
    tag: string(),
    variant: optional(string()),
  }),
  object({
    resourceCategory: string(),

    resource: string(),
    category: string(),
    tag: string(),
    variant: optional(string()),
  }),
]);

export type ResourceTagReferenceSchemaOutput = InferOutput<
  typeof ResourceTagReferenceSchema
>;
