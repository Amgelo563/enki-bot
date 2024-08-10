import type { GenericSchema } from 'valibot';
import { literal, nullish, union } from 'valibot';

// Constructs a schema that can be either the schema, `false`, `undefined`, `null` or empty string.
export function FalsySchema<T extends GenericSchema>(schema: T) {
  return nullish(union([schema, literal(false), literal('')]));
}
