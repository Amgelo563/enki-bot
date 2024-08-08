import { Collection } from 'discord.js';

import type { PathBuilder } from '../../../path/PathBuilder';
import type { Resource } from '../../Resource';
import type { ResourceSerializer } from '../../serializer/ResourceSerializer';
import type { ResourceAtlasSchemaOutput } from '../schema/ResourceAtlasSchema';

export class ResourceAtlasSerializer {
  protected readonly resourceSerializer: ResourceSerializer;

  constructor(resourceSerializer: ResourceSerializer) {
    this.resourceSerializer = resourceSerializer;
  }

  public async decode(
    data: ResourceAtlasSchemaOutput,
    current: PathBuilder,
  ): Promise<Collection<string, Resource>> {
    const result = new Collection<string, Resource>();

    for (const categoryData of data) {
      const category = await this.resourceSerializer.decode(
        categoryData,
        current.clone(),
      );
      result.set(category.getId(), category);
    }

    return result;
  }
}
