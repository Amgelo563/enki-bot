import { ButtonStyle } from 'discord.js';
import {
  emoji,
  maxLength,
  object,
  optional,
  picklist,
  pipe,
  regex,
  string,
  transform,
  union,
} from 'valibot';

import { NonEmptyStringSchema } from '../../../schemas/NonEmptyStringSchema';
import { MessageButtonLimits } from '../limits/MessageButtonLimits';

type ButtonStyleKeys = Exclude<keyof typeof ButtonStyle, 'Link' | 'Premium'>;

const styleKeys = Object.keys(ButtonStyle).filter(
  (key) => key !== 'Link' && key !== 'Premium',
) as ButtonStyleKeys[];

export const LinkMessageButtonSchema = object({
  label: pipe(NonEmptyStringSchema, maxLength(MessageButtonLimits.Label)),
  emoji: optional(
    union([
      // Unicode emoji
      pipe(string(), emoji(), maxLength(2)),
      // Custom Discord emoji
      pipe(
        string(),
        // https://sapphirejs.dev/docs/Guide/utilities/Discord_Utilities/UsefulRegexes/#emoji-regex
        regex(/^(?:<(?<animated>a)?:(?<name>\w{2,32}):)?(?<id>\d{17,21})>?$/),
      ),
    ]),
  ),
});

export const NonLinkMessageButtonSchema = object({
  ...LinkMessageButtonSchema.entries,
  style: pipe(
    picklist(styleKeys),
    transform((style) => ButtonStyle[style]),
  ),
});
