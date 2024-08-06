import type { Collection } from 'discord.js';
import type { InferOutput, ObjectSchema } from 'valibot';

export interface GlobFilesReader<Schema extends ObjectSchema<any, undefined>> {
  read(globs: string[]): Promise<Collection<string, InferOutput<Schema>>>;
}
