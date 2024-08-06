import type { BaseIssue, BaseSchema } from 'valibot';

// Type for any schema provided by Valibot.
export type AnyValibotSchema = BaseSchema<unknown, unknown, BaseIssue<unknown>>;
