import type { InferOutput } from 'valibot';
import { object, pipe, transform } from 'valibot';

import { GlobsArraySchema } from '../../../schemas/GlobsArraySchema';
import { NonEmptyStringSchema } from '../../../schemas/NonEmptyStringSchema';

export const ResourceCategorySchema = pipe(
  object({
    name: NonEmptyStringSchema,
    resources: GlobsArraySchema,
  }),
  transform((category) => ({
    ...category,
    id: category.name,
  })),
);

export type ResourceCategorySchemaOutput = InferOutput<
  typeof ResourceCategorySchema
>;
