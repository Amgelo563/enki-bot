import type { InferOutput } from 'valibot';
import { maxLength, object, pipe, regex } from 'valibot';

import { LocalizableSchema } from '../schemas/LocalizableSchema';
import { NonEmptyStringSchema } from '../schemas/NonEmptyStringSchema';
import { CommandLimits } from './limits/CommandLimits';

const BaseCommandOptionSchema = object({
  name: pipe(
    NonEmptyStringSchema,
    regex(CommandLimits.NameRegex),
    maxLength(CommandLimits.Option.Name),
  ),
  description: pipe(
    NonEmptyStringSchema,
    maxLength(CommandLimits.Option.Description),
  ),
});

export const CommandOptionSchema = object({
  ...BaseCommandOptionSchema.entries,
  ...LocalizableSchema(BaseCommandOptionSchema).entries,
});

export type CommandOptionSchemaOutput = InferOutput<typeof CommandOptionSchema>;
