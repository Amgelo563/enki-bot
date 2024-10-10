import { ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import type { InferOutput } from 'valibot';
import {
  array,
  check,
  maxLength,
  object,
  picklist,
  pipe,
  regex,
  transform,
} from 'valibot';

import { FalsySchema } from '../schemas/FalsySchema';
import { LocalizableSchema } from '../schemas/LocalizableSchema';
import { NonEmptyStringSchema } from '../schemas/NonEmptyStringSchema';
import { CommandOptionSchema } from './CommandOptionSchema';
import type { IntegrationTypeKey } from './contexts/IntegrationType';
import { IntegrationTypeKeys } from './contexts/IntegrationType';
import type { InteractionContextKey } from './contexts/InteractionContext';
import { InteractionContextKeys } from './contexts/InteractionContext';
import { CommandLimits } from './limits/CommandLimits';

const BaseCommandSchema = object({
  name: pipe(
    NonEmptyStringSchema,
    regex(CommandLimits.NameRegex),
    maxLength(CommandLimits.Name),
  ),
  description: pipe(NonEmptyStringSchema, maxLength(CommandLimits.Description)),

  integrationTypes: pipe(
    FalsySchema(array(picklist(IntegrationTypeKeys))),
    transform((types) => {
      if (!types) return null;
      return Object.entries(types).map(
        ([k]) => ApplicationIntegrationType[k as IntegrationTypeKey],
      );
    }),
    check((types) => {
      if (!types) return true;
      return types.length > 0;
    }, 'Specify at least one integrationTypes, or set it to false.'),
  ),

  interactionContexts: pipe(
    FalsySchema(array(picklist(InteractionContextKeys))),
    transform((contexts) => {
      if (!contexts) return null;
      return Object.entries(contexts).map(
        ([k]) => InteractionContextType[k as InteractionContextKey],
      );
    }),
    check((types) => {
      if (!types) return true;
      return types.length > 0;
    }, 'Specify at least one interactionContexts, or set it to false.'),
  ),
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
