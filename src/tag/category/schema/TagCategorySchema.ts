import type { InferOutput } from 'valibot';
import { boolean, object, pipe, transform } from 'valibot';

import { CommandSchemaWithOptions } from '../../../command/CommandSchema';
import { MessageSchemaWithButtons } from '../../../message/schema/MessageSchema';
import { FalsySchema } from '../../../schemas/FalsySchema';
import { GlobsArraySchema } from '../../../schemas/GlobsArraySchema';

export const TagCategorySchema = pipe(
  object({
    tags: GlobsArraySchema,
    command: CommandSchemaWithOptions(['tag']),

    searchBy: object({
      content: boolean(),
      embeds: boolean(),
    }),

    message: FalsySchema(MessageSchemaWithButtons),
  }),
  transform((data) => ({
    ...data,
    id: data.command.name,
  })),
);

export type TagCategorySchemaOutput = InferOutput<typeof TagCategorySchema>;
