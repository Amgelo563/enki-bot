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

  transform((resource) => ({
    ...resource,
    id: resource.command.name,
  })),

  check(
    (resource) => {
      const length = resource.tags.length + resource.categories.length;
      return length > 0;
    },
    (issue) => `Resource '${issue.input.id}' has no tags or categories.`,
  ),

  check(
    (resource) => {
      return resource.categories.length <= CommandLimits.Option.Amount;
    },
    (issue) =>
      `Resource '${issue.input.id}' has ${issue.input.categories.length} categories. It must not exceed ${CommandLimits.Option.Amount}.`,
  ),
);

export type ResourceSchemaOutput = InferOutput<typeof ResourceSchema>;
