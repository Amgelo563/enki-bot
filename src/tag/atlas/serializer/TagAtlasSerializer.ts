import { Collection } from 'discord.js';

import type { PathBuilder } from '../../../path/PathBuilder';
import type { TagCategorySerializer } from '../../category/serializer/TagCategorySerializer';
import type { TagCategory } from '../../category/TagCategory';
import type { TagAtlasSchemaOutput } from '../schema/TagAtlasSchema';

export class TagAtlasSerializer {
  protected readonly categorySerializer: TagCategorySerializer;

  constructor(categorySerializer: TagCategorySerializer) {
    this.categorySerializer = categorySerializer;
  }

  public async decode(
    data: TagAtlasSchemaOutput,
    current: PathBuilder,
    resourceId: string | null,
  ): Promise<Collection<string, TagCategory>> {
    const result = new Collection<string, TagCategory>();

    for (const categoryData of data) {
      const category = await this.categorySerializer.decode(
        categoryData,
        current.clone(),
        resourceId,
      );
      result.set(category.getId(), category);
    }

    return result;
  }
}
