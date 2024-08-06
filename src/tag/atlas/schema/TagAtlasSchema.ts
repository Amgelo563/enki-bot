import type { InferOutput } from 'valibot';
import { array, check, minLength, pipe } from 'valibot';

import { CommandLimits } from '../../../command/limits/CommandLimits';

import { TagCategorySchema } from '../../category/schema/TagCategorySchema';

export const TagAtlasSchema = pipe(
  array(TagCategorySchema),
  minLength(1),

  check((categories) => {
    return categories.length <= CommandLimits.Amount;
  }, `There can't be more than ${CommandLimits.Amount} categories in a tag atlas.`),

  check((categories) => {
    const ids = new Set<string>();
    for (const category of categories) {
      if (ids.has(category.id)) return false;
      ids.add(category.id);
    }
    return true;
  }, 'Tag categories in a tag atlas must have unique ids (command names).'),
);

export type TagAtlasSchemaOutput = InferOutput<typeof TagAtlasSchema>;
