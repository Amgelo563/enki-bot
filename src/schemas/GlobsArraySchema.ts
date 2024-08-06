import { checkItems, pipe, tupleWithRest } from 'valibot';

import { NonEmptyStringSchema } from './NonEmptyStringSchema';

export const GlobsArraySchema = pipe(
  tupleWithRest([NonEmptyStringSchema], NonEmptyStringSchema),
  checkItems((item) => item.endsWith('.conf'), 'All globs must end with .conf'),
);
