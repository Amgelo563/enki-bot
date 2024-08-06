import { type BaseMessageOptions, Collection } from 'discord.js';

import { EnkiMessageComponentType } from '../../message/component/EnkiMessageComponentType';
import type { MessageSerializer } from '../../message/serializer/MessageSerializer';
import type { TagReferenceSchemaOutput } from '../reference/TagReferenceSchema';
import type { TagSchemaOutput } from '../schema/TagSchema';
import { Tag } from '../Tag';

export class TagSerializer {
  protected readonly messageSerializer: MessageSerializer;

  constructor(messageSerializer: MessageSerializer) {
    this.messageSerializer = messageSerializer;
  }

  public decode(
    path: string,
    data: TagSchemaOutput,
    reference: TagReferenceSchemaOutput,
  ): Tag {
    const { message } = data;
    const messageOptions = this.messageSerializer.serializeWithButtons(
      message,
      reference,
      path,
    );

    const customMessages = new Collection<string, BaseMessageOptions>();
    if (message.buttons) {
      const messageButtons = message.buttons.filter(
        (button) => button.type === EnkiMessageComponentType.Message,
      );
      for (const button of messageButtons) {
        const buttonOptions = this.messageSerializer.serializeWithoutButtons(
          button.message,
          path,
        );
        customMessages.set(button.id, buttonOptions);
      }
    }

    const variants = new Collection<string, BaseMessageOptions>();
    if (message.variants) {
      for (const [id, variant] of Object.entries(message.variants)) {
        const variantOptions = this.messageSerializer.serializeWithButtons(
          variant,
          reference,
          path,
        );
        variants.set(id, variantOptions);
      }
    }

    return new Tag(data, messageOptions, variants, customMessages);
  }
}
