import { literal, nullish, union } from 'valibot';
import type { AnyValibotSchema } from './AnyValibotSchema';

// Constructs a schema that can be either the schema, `false`, `undefined`, `null` or empty string.
export function FalsySchema<T extends AnyValibotSchema>(schema: T) {
  return nullish(union([schema, literal(false), literal('')]));
}
