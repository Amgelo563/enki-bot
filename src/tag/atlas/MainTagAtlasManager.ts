import { AssertionError } from '@nyx-discord/core';
import type { Collection } from 'discord.js';

import { FileReader } from '../../file/FileReader';
import type { PathsManager } from '../../path/PathsManager';
import type { TagCategory } from '../category/TagCategory';
import type { MainTagReferenceSchemaOutput } from '../reference/MainTagReferenceSchema';
import type { Tag } from '../Tag';
import { TagAtlasSchema } from './schema/TagAtlasSchema';
import type { TagAtlasSerializer } from './serializer/TagAtlasSerializer';

export class MainTagAtlasManager {
  public static readonly FileName = 'tag-atlas.conf';

  protected readonly pathManager: PathsManager;

  protected readonly serializer: TagAtlasSerializer;

  protected readonly fileReader: FileReader<typeof TagAtlasSchema>;

  protected categories: Collection<string, TagCategory> | null = null;

  constructor(
    pathManager: PathsManager,
    serializer: TagAtlasSerializer,
    fileReader: FileReader<typeof TagAtlasSchema>,
  ) {
    this.pathManager = pathManager;
    this.serializer = serializer;
    this.fileReader = fileReader;
  }

  public static create(
    path: PathsManager,
    atlasSerializer: TagAtlasSerializer,
  ): MainTagAtlasManager {
    const atlasPath = path.appendContentRoot(this.FileName);
    const fileReader = new FileReader<typeof TagAtlasSchema>(
      atlasPath,
      TagAtlasSchema,
    );

    return new MainTagAtlasManager(path, atlasSerializer, fileReader);
  }

  public async start(): Promise<Collection<string, TagCategory>> {
    if (this.categories) return this.categories;

    const read = await this.fileReader.read();
    this.categories = await this.serializer.decode(
      read,
      this.pathManager.getBuilderFromContentRoot(),
      null,
    );

    return this.categories;
  }

  public findByReference(
    reference: MainTagReferenceSchemaOutput,
  ): TagCategory | Tag | null {
    if (!this.categories) return null;

    if ('tag' in reference) {
      const category = this.categories.get(reference.category);
      if (!category) return null;

      return category.getTag(reference.tag);
    }

    return this.categories.get(reference.category) ?? null;
  }

  public getCategory(id: string): TagCategory | null {
    return this.categories?.get(id) ?? null;
  }

  public getCategories(): Collection<string, TagCategory> {
    if (!this.categories) throw new AssertionError('Atlas not loaded');

    return this.categories;
  }
}
