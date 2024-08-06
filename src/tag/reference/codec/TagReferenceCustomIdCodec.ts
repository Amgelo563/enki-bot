import type { ValueOf } from '@nyx-discord/core';
import { AbstractCustomIdCodec } from '@nyx-discord/framework';
import { safeParse } from 'valibot';

import type { TagReferenceSchemaOutput } from '../TagReferenceSchema';
import { TagReferenceSchema } from '../TagReferenceSchema';

export class TagReferenceCustomIdCodec extends AbstractCustomIdCodec<TagReferenceSchemaOutput> {
  public static readonly Namespace = 'REF';

  protected static readonly ShortenedReferenceKeys = {
    Category: 'c',
    Tag: 't',
    Resource: 'r',
    ResourceCategory: 'k',
    Variant: 'v',
  } as const;

  protected static readonly MessageIndex = 0;

  public static create(): TagReferenceCustomIdCodec {
    return new TagReferenceCustomIdCodec(
      AbstractCustomIdCodec.DefaultSeparator,
      AbstractCustomIdCodec.DefaultMetadataSeparator,
      TagReferenceCustomIdCodec.Namespace,
    );
  }

  public deserializeToReference(
    customId: string,
  ): TagReferenceSchemaOutput | null {
    const id = this.deserializeToObjectId(customId);
    if (!id) return null;
    try {
      const shortened = this.parseSimpleJson(id);
      const unshortened = this.unShortenReferenceKeys(shortened);

      const parsed = safeParse(TagReferenceSchema, unshortened, {
        abortEarly: true,
        abortPipeEarly: true,
      });
      if (!parsed.success) return null;

      return parsed.output;
    } catch {
      return null;
    }
  }

  public serializeMessageCustomId(
    tag: TagReferenceSchemaOutput,
    messageId: string,
  ): string {
    const customIdbuilder = this.createCustomIdBuilder(tag);
    customIdbuilder.setAt(TagReferenceCustomIdCodec.MessageIndex, messageId);
    return customIdbuilder.build();
  }

  public extractMessageReference(customId: string): string | null {
    const iterator = this.createIteratorFromCustomId(customId);
    if (!iterator) return null;
    return iterator.getAt(TagReferenceCustomIdCodec.MessageIndex, false);
  }

  protected getIdOf(serialized: TagReferenceSchemaOutput): string {
    const shortened = this.shortenTagReferenceKeys(serialized);
    return this.stringifyToSimpleJson(shortened);
  }

  protected shortenTagReferenceKeys(
    serialized: TagReferenceSchemaOutput,
  ): object {
    const { ShortenedReferenceKeys } = TagReferenceCustomIdCodec;

    const shortened: Record<
      ValueOf<(typeof TagReferenceCustomIdCodec)['ShortenedReferenceKeys']>,
      string | undefined
    > = {
      [ShortenedReferenceKeys.Tag]: undefined,
      [ShortenedReferenceKeys.Resource]: undefined,
      [ShortenedReferenceKeys.Category]: undefined,
      [ShortenedReferenceKeys.ResourceCategory]: undefined,
      [ShortenedReferenceKeys.Variant]: undefined,
    };

    if ('tag' in serialized) {
      shortened[ShortenedReferenceKeys.Tag] = serialized.tag;
    }
    if ('category' in serialized) {
      shortened[ShortenedReferenceKeys.Category] = serialized.category;
    }
    if ('resource' in serialized) {
      shortened[ShortenedReferenceKeys.Resource] = serialized.resource;
    }
    if ('resourceCategory' in serialized) {
      shortened[ShortenedReferenceKeys.ResourceCategory] =
        serialized.resourceCategory;
    }
    if ('variant' in serialized) {
      shortened[ShortenedReferenceKeys.Variant] = serialized.variant;
    }

    return Object.fromEntries(
      Object.entries(shortened).filter(([, v]) => !!v),
    ) as object;
  }

  protected unShortenReferenceKeys(shortened: object): object {
    const { ShortenedReferenceKeys } = TagReferenceCustomIdCodec;

    const unShortened: Record<string, string> = {};

    if (ShortenedReferenceKeys.Tag in shortened) {
      unShortened.tag = shortened[ShortenedReferenceKeys.Tag] as string;
    }
    if (ShortenedReferenceKeys.Category in shortened) {
      unShortened.category = shortened[
        ShortenedReferenceKeys.Category
      ] as string;
    }
    if (ShortenedReferenceKeys.Resource in shortened) {
      unShortened.resource = shortened[
        ShortenedReferenceKeys.Resource
      ] as string;
    }
    if (ShortenedReferenceKeys.ResourceCategory in shortened) {
      unShortened.resourceCategory = shortened[
        ShortenedReferenceKeys.ResourceCategory
      ] as string;
    }
    if (ShortenedReferenceKeys.Variant in shortened) {
      unShortened.variant = shortened[ShortenedReferenceKeys.Variant] as string;
    }

    return unShortened;
  }

  protected stringifyToSimpleJson(serialized: object): string {
    // Map to 'key:value,otherKey:otherValue' to save space
    return Object.entries(serialized)
      .filter(([, v]) => !!v)
      .map(([k, v]) => `${k}:${v}`)
      .join(',');
  }

  protected parseSimpleJson(json: string): object {
    const shortenedResult = {} as Record<string, string>;

    const entries = json.split(',');
    for (const entry of entries) {
      const [k, v] = entry.split(':');
      shortenedResult[k] = v;
    }

    return shortenedResult;
  }
}
