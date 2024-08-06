import type { InferOutput } from 'valibot';
import { object, pipe, transform, tupleWithRest } from 'valibot';

import { CommandSchema } from '../../command/CommandSchema';
import { MessageSchemaWithVariants } from '../../message/schema/MessageSchema';
import { FalsySchema } from '../../schemas/FalsySchema';
import { NonEmptyStringSchema } from '../../schemas/NonEmptyStringSchema';

export const TagSchema = pipe(
  object({
    keywords: tupleWithRest([NonEmptyStringSchema], NonEmptyStringSchema),
    command: FalsySchema(CommandSchema),
    message: MessageSchemaWithVariants,
  }),
  transform((data) => ({
    ...data,
    id: data.keywords[0],
  })),
);

export type TagSchemaOutput = InferOutput<typeof TagSchema>;
