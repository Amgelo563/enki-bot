import parse from '@pushcorn/hocon-parser';
import { statSync } from 'fs';
import { existsSync } from 'node:fs';
import type { GenericSchema, InferOutput, ValiError } from 'valibot';
import { flatten, parse as parseSchema } from 'valibot';

import { LogProvider } from '../log/LogProvider';

export class FileReader<Schema extends GenericSchema> {
  public static readonly Extension = '.conf';

  protected readonly path: string;

  protected readonly schema: Schema;

  protected cached: InferOutput<Schema> | undefined;

  constructor(path: string, schema: Schema) {
    this.path = path.endsWith(FileReader.Extension)
      ? path
      : `${path}${FileReader.Extension}`;

    this.schema = schema;
  }

  public async read(): Promise<InferOutput<Schema>> {
    if (this.cached) {
      return this.cached;
    }

    if (!existsSync(this.path)) {
      throw new Error(`File '${this.path}' not found`);
    }

    const stat = statSync(this.path);

    if (!stat || !stat.isFile()) {
      throw new Error(`File '${this.path}' not found or is not a file`);
    }

    const read = await parse({
      url: this.path,
      strict: false,
    });

    try {
      this.cached = parseSchema(this.schema, read);
    } catch (e) {
      const error = e as ValiError<Schema>;
      const logged = 'issues' in error ? flatten<Schema>(error.issues) : error;
      LogProvider.get().error(
        `There was an error while validating file ${this.path}:\n`,
        logged.nested ? logged.nested : logged.root,
        '\nStack:\n',
        error.stack,
      );

      process.exit(1);
    }

    return this.cached;
  }

  public getCached(): InferOutput<Schema> | undefined {
    return this.cached;
  }
}
