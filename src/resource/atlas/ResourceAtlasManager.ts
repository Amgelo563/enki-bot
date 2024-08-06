import { IllegalStateError } from '@nyx-discord/core';
import type { Collection } from 'discord.js';

import { FileReader } from '../../file/FileReader';
import { BasicGlobFilesReader } from '../../file/glob/BasicGlobFilesReader';
import type { GlobFilesReader } from '../../file/glob/GlobFilesReader';
import type { PathsManager } from '../../path/PathsManager';
import type { TagAtlasSerializer } from '../../tag/atlas/serializer/TagAtlasSerializer';
import type { TagCategory } from '../../tag/category/TagCategory';
import type { ResourceTagReferenceSchemaOutput } from '../../tag/reference/ResourceTagReferenceSchema';
import type { TagSchema } from '../../tag/schema/TagSchema';
import type { TagSerializer } from '../../tag/serializer/TagSerializer';
import type { Tag } from '../../tag/Tag';
import type { ResourceCategory } from '../category/ResourceCategory';
import { ResourceCategorySerializer } from '../category/serializer/ResourceCategorySerializer';
import { ResourceSchema } from '../schema/ResourceSchema';
import { ResourceSerializer } from '../serializer/ResourceSerializer';
import { ResourceAtlasSchema } from './schema/ResourceAtlasSchema';
import { ResourceAtlasSerializer } from './serializer/ResourceAtlasSerializer';

export class ResourceAtlasManager {
  public static readonly FileName = 'resource-atlas.conf';

  protected readonly pathManager: PathsManager;

  protected readonly serializer: ResourceAtlasSerializer;

  protected readonly fileReader: FileReader<typeof ResourceAtlasSchema>;

  protected categories: Collection<string, ResourceCategory> | null = null;

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
    const resourceCategorySerializer = new ResourceCategorySerializer(
      resourceSerializer,
      new BasicGlobFilesReader(ResourceSchema),
    );
    const resourceAtlasSerializer = new ResourceAtlasSerializer(
      resourceCategorySerializer,
    );

    return new ResourceAtlasManager(path, resourceAtlasSerializer, fileReader);
  }

  public async start(): Promise<Collection<string, ResourceCategory>> {
    if (this.categories) return this.categories;

    const read = await this.fileReader.read();
    this.categories = await this.serializer.decode(
      read,
      this.pathManager.getBuilderFromContentRoot(),
    );

    return this.categories;
  }

  public findByReference(
    reference: ResourceTagReferenceSchemaOutput,
  ): TagCategory | Tag | null {
    if (!this.categories) return null;

    const category = this.categories.get(reference.resourceCategory);
    if (!category) return null;

    const resource = category.getResource(reference.resource);
    if (!resource) return null;

    if ('category' in reference) {
      const category = resource.getTagCategory(reference.category);
      if (!category) return null;

      return 'tag' in reference ? category.getTag(reference.tag) : category;
    }

    return resource.getTag(reference.tag);
  }

  public getCategory(id: string): ResourceCategory | null {
    return this.categories?.get(id) ?? null;
  }

  public getCategories(): Collection<string, ResourceCategory> {
    if (!this.categories) throw new IllegalStateError('Atlas not loaded');

    return this.categories;
  }
}
