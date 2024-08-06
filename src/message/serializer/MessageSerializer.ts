import { AssertionError } from '@nyx-discord/core';
import { NotImplementedError } from '@nyx-discord/framework';
import type { APIEmbed, BaseMessageOptions } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import type { PathsManager } from '../../path/PathsManager';
import type { TagReferenceCustomIdCodec } from '../../tag/reference/codec/TagReferenceCustomIdCodec';
import type { TagReferenceSchemaOutput } from '../../tag/reference/TagReferenceSchema';
import type { TagMessageButtonSchemaOutput } from '../button/TagMessageButtonSchema';
import { EnkiMessageComponentType } from '../component/EnkiMessageComponentType';
import { MessageComponentLimits } from '../component/MessageComponentLimits';
import type { MessageEmbedSchemaOutput } from '../embed/MessageEmbedSchema';
import type {
  MessageSchemaWithButtonsOutput,
  MessageSchemaWithoutButtonsOutput,
} from '../schema/MessageSchema';

export class MessageSerializer {
  protected readonly paths: PathsManager;

  protected readonly customIdCodec: TagReferenceCustomIdCodec;

  constructor(paths: PathsManager, customIdCodec: TagReferenceCustomIdCodec) {
    this.paths = paths;
    this.customIdCodec = customIdCodec;
  }

  public serializeWithButtons(
    message: MessageSchemaWithButtonsOutput,
    reference: TagReferenceSchemaOutput,
    currentPath: string,
  ): BaseMessageOptions {
    const result = this.serializeWithoutButtons(message, currentPath);
    if (!message.buttons) return result;

    const buttons: ButtonBuilder[] = this.serializeButtons(
      reference,
      message.buttons,
    );

    // 2d array of button builders chunks, each chunk with a max of MessageComponentLimits.ButtonsPerRow
    const chunks = buttons.reduce((result, button, index) => {
      const chunkIndex = Math.floor(
        index / MessageComponentLimits.ButtonsPerRow,
      );
      if (!result[chunkIndex]) {
        result[chunkIndex] = [];
      }

      result[chunkIndex].push(button);
      return result;
    }, [] as ButtonBuilder[][]);

    const components = chunks.map((chunk) => {
      return new ActionRowBuilder<ButtonBuilder>().addComponents(chunk);
    });

    return {
      ...result,
      components,
    };
  }

  public serializeWithoutButtons(
    message: MessageSchemaWithoutButtonsOutput,
    currentPath: string,
  ): BaseMessageOptions {
    const content = message.content ? message.content : undefined;

    const files: string[] = [];
    if (message.files) {
      const currentAbsolute = this.paths.appendRoot(currentPath);

      files.push(
        ...this.serializeAndCheckFiles(currentAbsolute, message.files),
      );
    }

    return {
      content,
      files: files.length ? files : undefined,
      embeds: message.embeds ? this.serializeEmbeds(message.embeds) : undefined,
    };
  }

  protected serializeButtons(
    reference: TagReferenceSchemaOutput,
    buttons: TagMessageButtonSchemaOutput[],
  ): ButtonBuilder[] {
    const result: ButtonBuilder[] = [];

    for (const data of buttons) {
      const builder = new ButtonBuilder().setLabel(data.label);

      if ('style' in data) {
        builder.setStyle(data.style);
      }

      if (data.emoji) {
        builder.setEmoji(data.emoji);
      }

      switch (data.type) {
        case EnkiMessageComponentType.Message: {
          const customId = this.customIdCodec.serializeMessageCustomId(
            reference,
            data.id,
          );
          result.push(builder.setCustomId(customId));
          break;
        }

        case EnkiMessageComponentType.Tag: {
          const customId = this.customIdCodec.serializeToCustomId(data.tag);
          result.push(builder.setCustomId(customId));
          break;
        }

        case EnkiMessageComponentType.Url:
          result.push(builder.setStyle(ButtonStyle.Link).setURL(data.url));
          break;

        default:
          throw new NotImplementedError();
      }
    }

    return result;
  }

  protected serializeAndCheckFiles(
    currentAbsolute: string,
    files: string[],
  ): string[] {
    return files.map((file) => {
      const path = file.startsWith('./')
        ? this.paths.join(currentAbsolute, file.substring(2))
        : this.paths.appendRoot(file);

      if (!this.paths.checkFile(path)) {
        throw new AssertionError(`File '${path}' not found.`);
      }

      return path;
    });
  }

  protected serializeEmbeds(embeds: MessageEmbedSchemaOutput[]): APIEmbed[] {
    return embeds.map((embed) => {
      const color = embed.color
        ? Number.parseInt(embed.color.substring(1), 16)
        : undefined;

      return {
        ...embed,
        color,
        image: embed.image ? { url: embed.image } : undefined,
        thumbnail: embed.thumbnail ? { url: embed.thumbnail } : undefined,
      };
    });
  }
}
