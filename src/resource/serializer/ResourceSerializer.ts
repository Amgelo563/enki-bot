import { AssertionError } from '@nyx-discord/core';
import { Collection } from 'discord.js';
import { join as pathJoin } from 'node:path';

import { CommandLimits } from '../../command/limits/CommandLimits';
import type { GlobFilesReader } from '../../file/glob/GlobFilesReader';
import type { PathBuilder } from '../../path/PathBuilder';
import type { TagAtlasSerializer } from '../../tag/atlas/serializer/TagAtlasSerializer';
import type { TagReferenceSchemaOutput } from '../../tag/reference/TagReferenceSchema';
import type { TagSchema } from '../../tag/schema/TagSchema';
import type { TagSerializer } from '../../tag/serializer/TagSerializer';
import { Resource } from '../Resource';
import type { ResourceSchemaOutput } from '../schema/ResourceSchema';

export class ResourceSerializer {
  protected readonly tagSerializer: TagSerializer;

  protected readonly tagAtlasSerializer: TagAtlasSerializer;

  protected readonly globReader: GlobFilesReader<typeof TagSchema>;

  constructor(
    tagSerializer: TagSerializer,
    tagAtlasSerializer: TagAtlasSerializer,
    globReader: GlobFilesReader<typeof TagSchema>,
  ) {
    this.tagSerializer = tagSerializer;
    this.tagAtlasSerializer = tagAtlasSerializer;
    this.globReader = globReader;
  }

  public async decode(
    resourceData: ResourceSchemaOutput,
    current: PathBuilder,
  ): Promise<Resource> {
    const tagsDatas = await this.globReader.read(
      resourceData.tags.map((glob) => current.clone().add(glob).build()),
    );

    const tagsEntries = tagsDatas.map((tagData, path) => {
      const { command } = tagData;
      if (!command) {
        throw new AssertionError(
          `Tag '${tagData.id}' in resource '${resourceData.id}' doesn't have a command. Every tag in a resource must have one.`,
        );
      }

      const reference: TagReferenceSchemaOutput = {
        tag: tagData.id,
        resource: resourceData.id,
      };

      const folderPath = pathJoin(path, '..');
      const tag = this.tagSerializer.decode(folderPath, tagData, reference);
      return [tag.getId(), tag] as const;
    });

    const categories = await this.tagAtlasSerializer.decode(
      resourceData.categories,
      current,
      resourceData.id,
    );

    const amount = tagsEntries.length + categories.size;
    if (amount > CommandLimits.Option.Amount) {
      throw new AssertionError(
        `Resource '${resourceData.id}' has ${amount} categories and tags in total. It must not exceed ${CommandLimits.Option.Amount}`,
      );
    }

    const tags = new Collection(tagsEntries);

    return new Resource(resourceData, tags, categories);
  }
}
