import type { InferOutput } from 'valibot';
import {
  boolean,
  check,
  literal,
  object,
  optional,
  pipe,
  string,
  transform,
  url,
  variant,
} from 'valibot';

import { NonEmptyStringSchema } from '../../schemas/NonEmptyStringSchema';
import { ConfigCommandOptionsSchema } from '../command/ConfigCommandOptionsSchema';
import { ConfigErrorsSchema } from '../errors/ConfigErrorsSchema';
import { ConfigSourceType } from '../type/ConfigSourceType';

export const ConfigSchema = object({
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
});

export type ConfigSchemaOutput = InferOutput<typeof ConfigSchema>;
