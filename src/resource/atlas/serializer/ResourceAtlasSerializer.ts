import { Collection } from 'discord.js';

import type { PathBuilder } from '../../../path/PathBuilder';
import type { ResourceCategory } from '../../category/ResourceCategory';
import type { ResourceCategorySerializer } from '../../category/serializer/ResourceCategorySerializer';
import type { ResourceAtlasSchemaOutput } from '../schema/ResourceAtlasSchema';

export class ResourceAtlasSerializer {
  protected readonly categorySerializer: ResourceCategorySerializer;

  constructor(categorySerializer: ResourceCategorySerializer) {
    this.categorySerializer = categorySerializer;
  }

  public async decode(
    data: ResourceAtlasSchemaOutput,
    current: PathBuilder,
  ): Promise<Collection<string, ResourceCategory>> {
    const result = new Collection<string, ResourceCategory>();

    for (const categoryData of data) {
      const category = await this.categorySerializer.decode(
        categoryData,
        current.clone(),
      );
      result.set(category.getId(), category);
    }

    return result;
  }
}
