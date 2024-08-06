import type { InferOutput } from 'valibot';
import { object } from 'valibot';

import { MessageSchemaWithButtons } from '../../message/schema/MessageSchema';

export const ConfigErrorsSchema = object({
  tagNotFound: MessageSchemaWithButtons,
  generic: MessageSchemaWithButtons,
});

export type ConfigErrorsSchemaOutput = InferOutput<typeof ConfigErrorsSchema>;
