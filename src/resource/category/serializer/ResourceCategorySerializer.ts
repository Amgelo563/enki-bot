import { AssertionError } from '@nyx-discord/core';
import { Collection } from 'discord.js';

import type { GlobFilesReader } from '../../../file/glob/GlobFilesReader';
import type { PathBuilder } from '../../../path/PathBuilder';
import type { Resource } from '../../Resource';
import type { ResourceSchema } from '../../schema/ResourceSchema';
import type { ResourceSerializer } from '../../serializer/ResourceSerializer';
import { ResourceCategory } from '../ResourceCategory';
import type { ResourceCategorySchemaOutput } from '../schema/ResourceCategorySchema';

export class ResourceCategorySerializer {
  protected readonly resourceSerializer: ResourceSerializer;

  protected readonly globReader: GlobFilesReader<typeof ResourceSchema>;

  constructor(
    resourceSerializer: ResourceSerializer,
    globReader: GlobFilesReader<typeof ResourceSchema>,
  ) {
    this.resourceSerializer = resourceSerializer;
    this.globReader = globReader;
  }

  public async decode(
    data: ResourceCategorySchemaOutput,
    current: PathBuilder,
  ): Promise<ResourceCategory> {
    const resourceGlobs = data.resources.map((glob) =>
      current.clone().add(glob).build(),
    );
    const resourcesData = await this.globReader.read(resourceGlobs);

    if (!resourcesData.size) {
      throw new AssertionError(
        `Resource category '${data.id}' has no resources.`,
      );
    }

    const resources = new Collection<string, Resource>();
    for (const [path, resourceData] of resourcesData) {
      const newPath = current.clone().set(path);
      const resource = await this.resourceSerializer.decode(
        resourceData,
        newPath,
        data.id,
      );
      resources.set(resource.getId(), resource);
    }

    return new ResourceCategory(data, resources);
  }
}
