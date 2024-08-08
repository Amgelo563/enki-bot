import type { InferOutput } from 'valibot';
import { array, check, pipe } from 'valibot';

import { CommandLimits } from '../../../command/limits/CommandLimits';
import { ResourceSchema } from '../../schema/ResourceSchema';

export const ResourceAtlasSchema = pipe(
  array(ResourceSchema),

  check((categories) => {
    return categories.length <= CommandLimits.Amount;
  }, `There can't be more than ${CommandLimits.Amount} resources in the resource atlas.`),

  check((categories) => {
    const ids = new Set<string>();
    for (const category of categories) {
      if (ids.has(category.id)) return false;
      ids.add(category.id);
    }
    return true;
  }, 'Resources in the resource atlas must have unique ids (names).'),
);

export type ResourceAtlasSchemaOutput = InferOutput<typeof ResourceAtlasSchema>;
