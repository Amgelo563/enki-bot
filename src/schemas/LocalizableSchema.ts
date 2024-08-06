import { Locale } from 'discord.js';
import type { InferOutput } from 'valibot';
import { object, picklist, pipe, record, transform } from 'valibot';

import type { AnyValibotSchema } from './AnyValibotSchema';
import { FalsySchema } from './FalsySchema';

const locales = Object.keys(Locale) as (keyof typeof Locale)[];

// Constructs a schema with a Locale record, with values of the given schema.
export function LocalizableSchema<T extends AnyValibotSchema>(schema: T) {
  return object({
    locale: FalsySchema(
      record(
        pipe(
          picklist(
            locales,
            `Locale keys must be one of ${Object.keys(Locale).join(', ')}`,
          ),
          transform((key) => Locale[key]),
        ),
        schema,
      ),
    ),
  });
}

export type LocalizableSchemaOutput<T extends AnyValibotSchema> = InferOutput<
  ReturnType<typeof LocalizableSchema<T>>
>;
