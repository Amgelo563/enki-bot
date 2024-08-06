import { Collection } from 'discord.js';
import { glob } from 'glob';
import path from 'node:path';
import type { InferOutput, ObjectSchema } from 'valibot';

import { FileReader } from '../FileReader';
import type { GlobFilesReader } from './GlobFilesReader';

export class BasicGlobFilesReader<Schema extends ObjectSchema<any, undefined>>
  implements GlobFilesReader<Schema>
{
  protected readonly schema: Schema;

  constructor(schema: Schema) {
    this.schema = schema;
  }

  public async read(
    absoluteGlobs: string[],
  ): Promise<Collection<string, InferOutput<Schema>>> {
    const filePaths = await glob(absoluteGlobs, { absolute: true });
    if (!filePaths.length) return new Collection();

    const fileReadPromises = filePaths.map((filePath) => {
      const fileReader = new FileReader(filePath, this.schema);
      return fileReader.read();
    });
    const fileContents = await Promise.all(fileReadPromises);

    const fileCollection = new Collection<string, InferOutput<Schema>>();
    for (const [i, filePath] of filePaths.entries()) {
      const folder = path.join(filePath, '..');
      fileCollection.set(folder, fileContents[i]);
    }

    return fileCollection;
  }
}
