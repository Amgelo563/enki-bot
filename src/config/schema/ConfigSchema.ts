import { ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import type { InferOutput } from 'valibot';
import {
  array,
  boolean,
  check,
  literal,
  object,
  optional,
  picklist,
  pipe,
  string,
  transform,
  url,
  variant,
} from 'valibot';

import {
  DefaultIntegrationTypes,
  IntegrationTypeKeys,
} from '../../command/contexts/IntegrationType';
import {
  DefaultInteractionContexts,
  InteractionContextKeys,
} from '../../command/contexts/InteractionContext';
import { NonEmptyStringSchema } from '../../schemas/NonEmptyStringSchema';
import { ConfigCommandOptionsSchema } from '../command/ConfigCommandOptionsSchema';
import { ConfigErrorsSchema } from '../errors/ConfigErrorsSchema';
import { ConfigSourceType } from '../type/ConfigSourceType';

export const ConfigSchema = pipe(
  object({
    token: string(),
    updateCommands: boolean(),
    debug: optional(boolean(), false),

    source: variant('type', [
      object({
        type: literal(ConfigSourceType.Local),
        contentFolder: optional(NonEmptyStringSchema, 'content'),
      }),
      pipe(
        object({
          type: literal(ConfigSourceType.Git),
          gitUrl: pipe(
            NonEmptyStringSchema,
            url(),
            check((url) => {
              return url.endsWith('.git');
            }, 'Git source URLs must be a .git repository'),
          ),
          cloneFolder: optional(NonEmptyStringSchema, '__clone__'),
          contentFolder: optional(NonEmptyStringSchema),
        }),
        transform((config) => ({
          ...config,
          repoName: config.gitUrl.split('/').at(-1) as string,
        })),
      ),
    ]),

    errors: ConfigErrorsSchema,

    options: ConfigCommandOptionsSchema,

    defaultIntegrations: optional(array(picklist(IntegrationTypeKeys))),
    defaultContexts: optional(array(picklist(InteractionContextKeys))),
  }),

  // Perform transformations for backwards compatibility.
  transform((data) => {
    const warnings: string[] = [];

    let defaultIntegrations = data.defaultIntegrations;
    if (!defaultIntegrations) {
      defaultIntegrations = DefaultIntegrationTypes;
      warnings.push(
        `No defaultIntegrations specified, defaulting to [${DefaultIntegrationTypes.join(',')}].`,
      );
    }

    let defaultContexts = data.defaultContexts;
    if (!defaultContexts) {
      defaultContexts = DefaultInteractionContexts;
      warnings.push(
        `'No defaultContexts specified, defaulting to [${DefaultInteractionContexts.join(',')}].'`,
      );
    }

    return {
      ...data,
      warnings,
      defaultIntegrations,
      defaultContexts,
    };
  }),

  transform((data) => ({
    ...data,
    defaultIntegrations: data.defaultIntegrations.map(
      (key) => ApplicationIntegrationType[key],
    ),
    defaultContexts: data.defaultContexts.map(
      (key) => InteractionContextType[key],
    ),
  })),
);

export type ConfigSchemaOutput = InferOutput<typeof ConfigSchema>;
