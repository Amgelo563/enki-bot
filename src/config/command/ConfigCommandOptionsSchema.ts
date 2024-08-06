import type { InferOutput } from 'valibot';
import { object } from 'valibot';
import { CommandOptionSchema } from '../../command/CommandOptionSchema';

export const ConfigCommandOptionsSchema = object({
  variant: CommandOptionSchema,
  hide: CommandOptionSchema,
});

export type ConfigCommandOptionsSchemaOutput = InferOutput<
  typeof ConfigCommandOptionsSchema
>;
