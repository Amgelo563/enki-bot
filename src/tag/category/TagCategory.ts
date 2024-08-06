import type { Identifiable } from '@nyx-discord/core';
import type {
  ApplicationCommandOptionChoiceData,
  BaseMessageOptions,
  Collection,
} from 'discord.js';
import type { CommandOptionSchemaOutput } from '../../command/CommandOptionSchema';
import type { CommandSchemaOutput } from '../../command/CommandSchema';

import { MiniSearchSearcher } from '../search/searcher/MiniSearchSearcher';
import type { TagSearcher } from '../search/searcher/TagSearcher';
import type { Tag } from '../Tag';
import type { TagCategorySchemaOutput } from './schema/TagCategorySchema';

export class TagCategory implements Identifiable<string> {
  protected readonly data: TagCategorySchemaOutput;

  protected readonly tags: Collection<string, Tag>;

  protected readonly searcher: TagSearcher;

  protected readonly message: BaseMessageOptions | null;

  protected hasVariantsCache: boolean | null = null;

  constructor(
    data: TagCategorySchemaOutput,
    tags: Collection<string, Tag>,
    searcher: TagSearcher,
    message: BaseMessageOptions | null,
  ) {
    this.data = data;
    this.tags = tags;
    this.searcher = searcher;
    this.message = message;
  }

  public static create(
    data: TagCategorySchemaOutput,
    tags: Collection<string, Tag>,
    message: BaseMessageOptions | null,
  ): TagCategory {
    const searcher = MiniSearchSearcher.create(data, tags);
    return new TagCategory(data, tags, searcher, message);
  }

  public search(query: string): ApplicationCommandOptionChoiceData[] {
    return this.searcher.search(query);
  }

  public hasVariants(): boolean {
    if (this.hasVariantsCache === null) {
      this.hasVariantsCache = !!this.tags.find((tag) => tag.hasVariants());
    }

    return this.hasVariantsCache;
  }

  public getTag(id: string): Tag | null {
    return this.tags.get(id) ?? null;
  }

  public getTags(): Collection<string, Tag> {
    return this.tags;
  }

  public getMessage(): BaseMessageOptions | null {
    return this.message;
  }

  public getCommand(): CommandSchemaOutput<'tag'> {
    return this.data.command;
  }

  public getTagOption(): CommandOptionSchemaOutput {
    return this.data.command.options.tag;
  }

  public getRaw(): TagCategorySchemaOutput {
    return this.data;
  }

  public getId(): string {
    return this.data.id;
  }
}
