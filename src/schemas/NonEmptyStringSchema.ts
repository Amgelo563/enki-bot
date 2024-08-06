import { minLength, pipe, string } from 'valibot';

// A schema that ensures a string is not empty
export const NonEmptyStringSchema = pipe(string(), minLength(1));
