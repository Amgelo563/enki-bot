import type { InferOutput } from 'valibot';
import {
  array,
  check,
  intersect,
  maxLength,
  minLength,
  object,
  pipe,
  record,
  transform,
  tupleWithRest,
} from 'valibot';

import { FalsySchema } from '../../schemas/FalsySchema';
import { NonEmptyStringSchema } from '../../schemas/NonEmptyStringSchema';
import type { TagReferenceSchemaOutput } from '../../tag/reference/TagReferenceSchema';
import { TagMessageButtonSchema } from '../button/TagMessageButtonSchema';
import { EnkiMessageComponentType } from '../component/EnkiMessageComponentType';
import { MessageComponentLimits } from '../component/MessageComponentLimits';
import { MessageEmbedLimits } from '../embed/limits/MessageEmbedLimits';
import { MessageEmbedSchema } from '../embed/MessageEmbedSchema';
import { MessageLimits } from '../limits/MessageLimits';

export const MessageSchemaWithoutButtons = pipe(
  object({
    content: FalsySchema(
      pipe(NonEmptyStringSchema, maxLength(MessageLimits.Content)),
    ),
    embeds: FalsySchema(
      pipe(
        array(MessageEmbedSchema),
        check((embeds) => {
          let sum = 0;

          for (const embed of embeds) {
            const title = embed.title.length;
            const description = embed.description?.length ?? 0;
            let fields = 0;
            for (const field of embed.fields ?? []) {
              fields += field.name.length + field.value.length;
            }
            const footer = embed.footer?.text.length ?? 0;
            const author = embed.author?.name.length ?? 0;

            sum += title + description + fields + footer + author;
          }

          return sum <= MessageEmbedLimits.Combined;
        }, `The combined sum of characters in all title, description, field.name, field.value, footer.text, and author.name fields across all embeds attached to a message must not exceed ${MessageEmbedLimits.Combined} characters`),
        minLength(1),
        maxLength(MessageLimits.Embeds),
      ),
    ),
    files: FalsySchema(
      pipe(
        tupleWithRest([NonEmptyStringSchema], NonEmptyStringSchema),
        maxLength(MessageLimits.Files),
        check((files) => {
          return files.every((file) => {
            const isAbsolute = file.startsWith('/') && file.length > 1;
            if (isAbsolute) return true;

            return file.startsWith('./') && file.length > 2;
          });
        }, 'All files must either absolute (starting with `/`) or relative (starting with `./`)'),
      ),
    ),
  }),

  check((input) => {
    if (!input.content && !input.embeds) return false;
    return !(input.embeds && !input.embeds.length);
  }, 'Either message content or embeds is required'),

  transform((data) => {
    let summary = data.content ? stripMarkdown(data.content) : '';
    const { embeds } = data;

    if (embeds) {
      const titles = embeds.map((embed) => stripMarkdown(embed.title));
      summary += titles.join(', ');
    }

    return {
      ...data,
      summary,
    };
  }),
);

export type MessageSchemaWithoutButtonsOutput = InferOutput<
  typeof MessageSchemaWithoutButtons
>;

export const MessageSchemaWithButtons = intersect([
  MessageSchemaWithoutButtons,
  pipe(
    object({
      buttons: FalsySchema(
        pipe(
          array(TagMessageButtonSchema),
          maxLength(
            MessageComponentLimits.ButtonsPerRow *
              MessageComponentLimits.ActionRow,
          ),
        ),
      ),
    }),

    transform((data) => {
      const references: TagReferenceSchemaOutput[] = [];

      const buttons = data.buttons ? data.buttons : [];
      const referenceButtons = buttons.filter(
        (button) => button.type === EnkiMessageComponentType.Tag,
      );

      for (const button of referenceButtons) {
        references.push(button.tag);
      }

      return {
        ...data,
        references,
      };
    }),
  ),
]);

export type MessageSchemaWithButtonsOutput = InferOutput<
  typeof MessageSchemaWithButtons
>;

export const MessageSchemaWithVariants = intersect([
  MessageSchemaWithButtons,
  object({
    variants: FalsySchema(
      record(NonEmptyStringSchema, MessageSchemaWithButtons),
    ),
  }),
]);

function stripMarkdown(input: string): string {
  return input.replaceAll('`', '').replaceAll('*', '').replaceAll('_', '');
}
