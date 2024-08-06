import type { InferOutput } from 'valibot';
import { array, check, minLength, pipe } from 'valibot';

import { CommandLimits } from '../../../command/limits/CommandLimits';
import { ResourceCategorySchema } from '../../category/schema/ResourceCategorySchema';

export const ResourceAtlasSchema = pipe(
  array(ResourceCategorySchema),
  minLength(1),

  check((categories) => {
    return categories.length <= CommandLimits.Amount;
  }, `There can't be more than ${CommandLimits.Amount} categories in the resource atlas.`),

  check((categories) => {
    const ids = new Set<string>();
    for (const category of categories) {
      if (ids.has(category.id)) return false;
      ids.add(category.id);
    }
    return true;
  }, 'Resource categories in the resource atlas must have unique ids (names).'),
);

export type ResourceAtlasSchemaOutput = InferOutput<typeof ResourceAtlasSchema>;
