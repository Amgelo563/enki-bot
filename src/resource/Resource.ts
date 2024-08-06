import type { Identifiable } from '@nyx-discord/core';
import type { Collection } from 'discord.js';

import type { TagCategory } from '../tag/category/TagCategory';
import type { Tag } from '../tag/Tag';
import type { ResourceSchemaOutput } from './schema/ResourceSchema';

export class Resource implements Identifiable<string> {
  protected readonly data: ResourceSchemaOutput;

  protected readonly tags: Collection<string, Tag>;

  protected readonly tagCategories: Collection<string, TagCategory>;

  constructor(
    data: ResourceSchemaOutput,
    tags: Collection<string, Tag>,
    tagCategories: Collection<string, TagCategory>,
  ) {
    this.data = data;
    this.tags = tags;
    this.tagCategories = tagCategories;
  }

  public getTag(id: string): Tag | null {
    return this.tags.get(id) ?? null;
  }

  public getTags(): Collection<string, Tag> {
    return this.tags;
  }

  public getTagCategory(id: string): TagCategory | null {
    return this.tagCategories.get(id) ?? null;
  }

  public getTagCategories(): Collection<string, TagCategory> {
    return this.tagCategories;
  }

  public getRaw(): ResourceSchemaOutput {
    return this.data;
  }

  public getId(): string {
    return this.data.id;
  }
}
