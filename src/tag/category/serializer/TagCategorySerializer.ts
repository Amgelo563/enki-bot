import { AssertionError } from '@nyx-discord/core';
import { Collection } from 'discord.js';
import type { GlobFilesReader } from '../../../file/glob/GlobFilesReader';
import type { MessageSerializer } from '../../../message/serializer/MessageSerializer';
import type { PathBuilder } from '../../../path/PathBuilder';
import type { TagReferenceSchemaOutput } from '../../reference/TagReferenceSchema';
import type { TagSchema } from '../../schema/TagSchema';
import type { TagSerializer } from '../../serializer/TagSerializer';
import type { TagCategorySchemaOutput } from '../schema/TagCategorySchema';
import { TagCategory } from '../TagCategory';

export class TagCategorySerializer {
  protected readonly tagSerializer: TagSerializer;

  protected readonly messageSerializer: MessageSerializer;

  protected readonly globReader: GlobFilesReader<typeof TagSchema>;

  constructor(
    tagSerializer: TagSerializer,
    messageSerializer: MessageSerializer,
    globReader: GlobFilesReader<typeof TagSchema>,
  ) {
    this.tagSerializer = tagSerializer;
    this.messageSerializer = messageSerializer;
    this.globReader = globReader;
  }

  public async decode(
    data: TagCategorySchemaOutput,
    current: PathBuilder,
    resourceId: string | null,
  ): Promise<TagCategory> {
    const globPaths = data.tags.map((glob) =>
      current.clone().add(glob).build(),
    );
    const tagDatas = await this.globReader.read(globPaths);

    if (!tagDatas.size) {
      throw new AssertionError(
        `Category '${data.id}'${resourceId ? ` in resource '${resourceId}'` : ''} has no tags.`,
      );
    }

    const entries = Array.from(tagDatas.entries()).map(([path, tag]) => {
      const reference: TagReferenceSchemaOutput = {
        resource: resourceId ?? undefined,
        category: data.id,
        tag: tag.id,
      };

      return [tag.id, this.tagSerializer.decode(path, tag, reference)] as const;
    });
    const tags = new Collection(entries);

    const message = data.message
      ? this.messageSerializer.serializeWithoutButtons(
          data.message,
          current.build(),
        )
      : null;

    return TagCategory.create(data, tags, message);
  }
}
