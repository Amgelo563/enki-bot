import { IllegalStateError } from '@nyx-discord/core';
import type { Collection } from 'discord.js';

import { FileReader } from '../../file/FileReader';
import type { GlobFilesReader } from '../../file/glob/GlobFilesReader';
import type { PathsManager } from '../../path/PathsManager';
import type { TagAtlasSerializer } from '../../tag/atlas/serializer/TagAtlasSerializer';
import type { TagCategory } from '../../tag/category/TagCategory';
import type { ResourceTagReferenceSchemaOutput } from '../../tag/reference/ResourceTagReferenceSchema';
import type { TagSchema } from '../../tag/schema/TagSchema';
import type { TagSerializer } from '../../tag/serializer/TagSerializer';
import type { Tag } from '../../tag/Tag';
import type { Resource } from '../Resource';
import { ResourceSerializer } from '../serializer/ResourceSerializer';
import { ResourceAtlasSchema } from './schema/ResourceAtlasSchema';
import { ResourceAtlasSerializer } from './serializer/ResourceAtlasSerializer';

export class ResourceAtlasManager {
  public static readonly FileName = 'resource-atlas.conf';

  protected readonly pathManager: PathsManager;

  protected readonly serializer: ResourceAtlasSerializer;

  protected readonly fileReader: FileReader<typeof ResourceAtlasSchema>;

  protected resources: Collection<string, Resource> | null = null;

  constructor(
    pathManager: PathsManager,
    serializer: ResourceAtlasSerializer,
    fileReader: FileReader<typeof ResourceAtlasSchema>,
  ) {
    this.pathManager = pathManager;
    this.serializer = serializer;
    this.fileReader = fileReader;
  }

  public static create(
    path: PathsManager,
    tagSerializer: TagSerializer,
    tagAtlasSerializer: TagAtlasSerializer,
    tagGlobReader: GlobFilesReader<typeof TagSchema>,
  ): ResourceAtlasManager {
    const atlasPath = path.appendContentRoot(this.FileName);
    const fileReader = new FileReader<typeof ResourceAtlasSchema>(
      atlasPath,
      ResourceAtlasSchema,
    );

    const resourceSerializer = new ResourceSerializer(
      tagSerializer,
      tagAtlasSerializer,
      tagGlobReader,
    );
    const resourceAtlasSerializer = new ResourceAtlasSerializer(
      resourceSerializer,
    );

    return new ResourceAtlasManager(path, resourceAtlasSerializer, fileReader);
  }

  public async start(): Promise<Collection<string, Resource>> {
    if (this.resources) return this.resources;

    const read = await this.fileReader.read();
    this.resources = await this.serializer.decode(
      read,
      this.pathManager.getBuilderFromContentRoot(),
    );

    return this.resources;
  }

  public findByReference(
    reference: ResourceTagReferenceSchemaOutput,
  ): TagCategory | Tag | null {
    if (!this.resources) return null;

    const resource = this.resources.get(reference.resource);
    if (!resource) return null;

    if ('category' in reference) {
      const category = resource.getTagCategory(reference.category);
      if (!category) return null;

      return 'tag' in reference ? category.getTag(reference.tag) : category;
    }

    return resource.getTag(reference.tag);
  }

  public getResources(): Collection<string, Resource> {
    if (!this.resources) throw new IllegalStateError('Atlas not loaded');

    return this.resources;
  }
}
