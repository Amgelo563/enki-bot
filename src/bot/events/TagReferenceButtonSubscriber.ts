import type { EventDispatchMeta } from '@nyx-discord/core';
import { AbstractDJSClientSubscriber } from '@nyx-discord/framework';
import type { ButtonInteraction, Interaction } from 'discord.js';
import { Events } from 'discord.js';

import type { ConfigWrapper } from '../../config/ConfigWrapper';
import type { ContentService } from '../../content/ContentService';
import { TagCategory } from '../../tag/category/TagCategory';
import type { TagReferenceSchemaOutput } from '../../tag/reference/TagReferenceSchema';

// eslint-disable-next-line max-len
export class TagReferenceButtonSubscriber extends AbstractDJSClientSubscriber<Events.InteractionCreate> {
  protected readonly event = Events.InteractionCreate;

  protected readonly service: ContentService;

  protected readonly config: ConfigWrapper;

  constructor(service: ContentService, config: ConfigWrapper) {
    super();
    this.service = service;
    this.config = config;
  }

  public async handleEvent(
    meta: EventDispatchMeta,
    interaction: Interaction,
  ): Promise<void> {
    if (!interaction.isButton()) return;

    const referenceCodec = this.service.getTagReferenceCodec();

    const reference = referenceCodec.deserializeToReference(
      interaction.customId,
    );
    if (!reference) return;

    const tagOrCategory = this.service.findByReference(reference);
    if (!tagOrCategory) {
      return this.replyNotFoundError(interaction, meta, reference);
    }

    if (tagOrCategory instanceof TagCategory) {
      const categoryMessage = tagOrCategory.getMessage();
      if (!categoryMessage) {
        return this.replyNotFoundError(interaction, meta, reference);
      }

      await interaction.reply({ ...categoryMessage, ephemeral: true });
      return;
    }

    if ('variant' in reference && reference.variant) {
      const variant = tagOrCategory.getVariant(reference.variant);
      if (!variant) {
        return this.replyNotFoundError(interaction, meta, reference);
      }

      await interaction.reply({ ...variant, ephemeral: true });
      return;
    }

    const messageId = referenceCodec.extractMessageReference(
      interaction.customId,
    );

    const tagMessage = messageId
      ? tagOrCategory.getCustomMessage(messageId)
      : tagOrCategory.getMessage();
    if (!tagMessage) {
      return this.replyNotFoundError(interaction, meta, reference);
    }

    await interaction.reply({ ...tagMessage, ephemeral: true });
  }

  protected async replyNotFoundError(
    interaction: ButtonInteraction,
    meta: EventDispatchMeta,
    reference: TagReferenceSchemaOutput,
  ): Promise<void> {
    const error = this.config.getTagNotFoundError();
    await interaction.reply({ ...error, ephemeral: true });
    meta.setHandled();
    meta
      .getBot()
      ?.getLogger()
      .error('Tag reference present but not found: ', reference);
  }
}
