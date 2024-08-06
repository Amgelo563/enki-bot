import type { InferOutput } from 'valibot';
import { check, object, pipe, transform } from 'valibot';

import { CommandSchema } from '../../command/CommandSchema';
import { CommandLimits } from '../../command/limits/CommandLimits';
import { GlobsArraySchema } from '../../schemas/GlobsArraySchema';
import { TagAtlasSchema } from '../../tag/atlas/schema/TagAtlasSchema';

export const ResourceSchema = pipe(
  object({
    command: CommandSchema,
    tags: GlobsArraySchema,
    categories: TagAtlasSchema,
  }),

  check(
    (resource) => {
      const length = resource.tags.length + resource.categories.length;
      return length > 0;
    },
    (issue) =>
      `(${issue.input.command.name}) At least one category or tag must be attached to a resource`,
  ),

  check(
    (resource) => {
      return resource.categories.length <= CommandLimits.Option.Amount;
    },
    (issue) =>
      `(${issue.input.command.name}) The amount of categories in a resource must not exceed ${CommandLimits.Option.Amount}`,
  ),

  transform((resource) => ({
    ...resource,
    id: resource.command.name,
  })),
);

export type ResourceSchemaOutput = InferOutput<typeof ResourceSchema>;
