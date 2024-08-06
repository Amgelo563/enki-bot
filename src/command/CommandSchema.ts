import type { Locale, LocalizationMap } from 'discord.js';
import type { InferOutput } from 'valibot';
import { maxLength, object, pipe, regex } from 'valibot';

import { LocalizableSchema } from '../schemas/LocalizableSchema';
import { NonEmptyStringSchema } from '../schemas/NonEmptyStringSchema';
import { CommandOptionSchema } from './CommandOptionSchema';
import { CommandLimits } from './limits/CommandLimits';

const BaseCommandSchema = object({
  name: pipe(
    NonEmptyStringSchema,
    regex(CommandLimits.NameRegex),
    maxLength(CommandLimits.Name),
  ),
  description: pipe(NonEmptyStringSchema, maxLength(CommandLimits.Description)),
});

export const CommandSchema = object({
  ...BaseCommandSchema.entries,
  ...LocalizableSchema(BaseCommandSchema).entries,
});

export function CommandSchemaWithOptions<T extends string>(optionNames: T[]) {
  const options = {} as Record<T, typeof CommandOptionSchema>;

  for (const name of optionNames) {
    options[name] = CommandOptionSchema;
  }

  return object({
    ...CommandSchema.entries,
    options: object(options),
  });
}

export type CommandSchemaOutput<
  Options extends string | undefined = undefined,
> = InferOutput<
  Options extends string
    ? ReturnType<typeof CommandSchemaWithOptions<Options>>
    : typeof CommandSchema
>;
