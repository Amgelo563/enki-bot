import { AssertionError } from '@nyx-discord/core';

import { CommandLimits } from '../command/limits/CommandLimits';
import { BasicGlobFilesReader } from '../file/glob/BasicGlobFilesReader';
import { MessageSerializer } from '../message/serializer/MessageSerializer';
import type { PathsManager } from '../path/PathsManager';
import { ResourceAtlasManager } from '../resource/atlas/ResourceAtlasManager';
import { MainTagAtlasManager } from '../tag/atlas/MainTagAtlasManager';
import { TagAtlasSerializer } from '../tag/atlas/serializer/TagAtlasSerializer';
import { TagCategorySerializer } from '../tag/category/serializer/TagCategorySerializer';
import { TagCategory } from '../tag/category/TagCategory';
import { TagReferenceCustomIdCodec } from '../tag/reference/codec/TagReferenceCustomIdCodec';
import type { TagReferenceSchemaOutput } from '../tag/reference/TagReferenceSchema';
import { TagSchema } from '../tag/schema/TagSchema';
import { TagSerializer } from '../tag/serializer/TagSerializer';
import type { Tag } from '../tag/Tag';

export class ContentService {
  // Warn once it reaches 70% of the amount of commands
  protected static readonly CommandWarnLimit = Math.ceil(
    CommandLimits.Amount * 0.7,
  );

  protected readonly paths: PathsManager;

  protected readonly mainTagAtlasManager: MainTagAtlasManager;

  protected readonly resourceAtlasManager: ResourceAtlasManager;

  protected readonly tagReferenceCodec: TagReferenceCustomIdCodec;

  protected readonly messageSerializer: MessageSerializer;

  constructor(
    paths: PathsManager,
    mainTagAtlas: MainTagAtlasManager,
    resourceAtlas: ResourceAtlasManager,
    tagReferenceCodec: TagReferenceCustomIdCodec,
    messageSerializer: MessageSerializer,
  ) {
    this.paths = paths;
    this.mainTagAtlasManager = mainTagAtlas;
    this.resourceAtlasManager = resourceAtlas;
    this.tagReferenceCodec = tagReferenceCodec;
    this.messageSerializer = messageSerializer;
  }

  public static create(pathManager: PathsManager): ContentService {
    const tagReferenceCodec = TagReferenceCustomIdCodec.create();
    const messageSerializer = new MessageSerializer(
      pathManager,
      tagReferenceCodec,
    );

    const tagSerializer = new TagSerializer(messageSerializer);
    const tagGlobReader = new BasicGlobFilesReader(TagSchema);
    const tagCategorySerializer = new TagCategorySerializer(
      tagSerializer,
      messageSerializer,
      tagGlobReader,
    );
    const tagAtlasSerializer = new TagAtlasSerializer(tagCategorySerializer);

    const mainTagAtlasManager = MainTagAtlasManager.create(
      pathManager,
      tagAtlasSerializer,
    );
    const resourceAtlasManager = ResourceAtlasManager.create(
      pathManager,
      tagSerializer,
      tagAtlasSerializer,
      tagGlobReader,
    );

    return new ContentService(
      pathManager,
      mainTagAtlasManager,
      resourceAtlasManager,
      tagReferenceCodec,
      messageSerializer,
    );
  }

  public async loadContent(): Promise<void> {
    await this.mainTagAtlasManager.start();
    await this.resourceAtlasManager.start();

    this.assertAllReferences();
    this.assertSizes();
  }

  public findByReference(
    reference: TagReferenceSchemaOutput,
  ): Tag | TagCategory | null {
    return 'resource' in reference
      ? this.resourceAtlasManager.findByReference(reference)
      : this.mainTagAtlasManager.findByReference(reference);
  }

  public getMainTagAtlasManager(): MainTagAtlasManager {
    return this.mainTagAtlasManager;
  }

  public getResourceAtlasManager(): ResourceAtlasManager {
    return this.resourceAtlasManager;
  }

  public getTagReferenceCodec(): TagReferenceCustomIdCodec {
    return this.tagReferenceCodec;
  }

  public getMessageSerializer(): MessageSerializer {
    return this.messageSerializer;
  }

  protected assertAllReferences(): void {
    for (const [categoryId, category] of this.mainTagAtlasManager
      .getCategories()
      .entries()) {
      for (const [tagId, tag] of category.getTags().entries()) {
        const { references } = tag.getRaw().message;
        if (!references.length) continue;

        const message = `Tag category: ${categoryId}, Tag: ${tagId}`;
        this.assertReference(message, references);
      }
    }

    for (const [resourceId, resource] of this.resourceAtlasManager
      .getResources()
      .entries()) {
      for (const [tagId, tag] of resource.getTags().entries()) {
        const { references } = tag.getRaw().message;
        if (!references.length) continue;

        const message = `Resource: '${resourceId}', Tag: '${tagId}'`;
        this.assertReference(message, references);
      }

      for (const [tagCatId, tagCategory] of resource
        .getTagCategories()
        .entries()) {
        for (const [tagId, tag] of tagCategory.getTags().entries()) {
          const { references } = tag.getRaw().message;
          if (!references.length) continue;

          const message = `Resource: '${resourceId}', Tag category: '${tagCatId}', Tag: '${tagId}'`;
          this.assertReference(message, references);
        }
      }
    }
  }

  protected assertReference(
    name: string,
    references: TagReferenceSchemaOutput[],
  ): void {
    for (const reference of references) {
      const foundReference = this.findByReference(reference);

      if (!foundReference) {
        throw new AssertionError(
          `Reference on ${name} not found. Fix reference: ${JSON.stringify(reference)}`,
        );
      }

      if (foundReference instanceof TagCategory) {
        if (!foundReference.getMessage()) {
          throw new AssertionError(
            `Tag category reference on ${name} has no message. Fix reference: ${JSON.stringify(reference)}`,
          );
        }
      } else {
        if (!('variant' in reference) || !reference.variant) continue;

        if (!foundReference.getVariant(reference.variant)) {
          throw new AssertionError(
            `Tag reference on ${name} has no variant "${reference.variant}". Fix reference: ${JSON.stringify(reference)}`,
          );
        }
      }
    }
  }

  protected assertSizes(): void {
    const mainTagAtlasCategoriesSize =
      this.mainTagAtlasManager.getCategories().size;
    const mainTagAtlasCommandTagsSize = this.mainTagAtlasManager
      .getCategories()
      .reduce((totalCommands, category) => {
        const categoryCommands = category
          .getTags()
          .reduce(
            (categoryCommands, tag) =>
              tag.getRaw().command ? categoryCommands + 1 : categoryCommands,
            0,
          );

        return totalCommands + categoryCommands;
      }, 0);

    const resourceAtlasSize = this.resourceAtlasManager.getResources().size;

    const total =
      mainTagAtlasCategoriesSize +
      mainTagAtlasCommandTagsSize +
      resourceAtlasSize;

    if (total <= ContentService.CommandWarnLimit) return;
    if (total >= CommandLimits.Amount) {
      throw new AssertionError(`Loaded too many commands:
* Main Tag Atlas Categories: ${mainTagAtlasCategoriesSize}
* Tags in the Main Tag Atlas with command properties: ${mainTagAtlasCommandTagsSize}
* Resources: ${resourceAtlasSize}
In total: ${total}.
Limit is: ${CommandLimits.Amount}`);
    }
  }
}
