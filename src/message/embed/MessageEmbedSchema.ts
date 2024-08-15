import type { InferOutput } from 'valibot';
import {
  array,
  boolean,
  check,
  hexColor,
  maxLength,
  minLength,
  object,
  optional,
  pipe,
  string,
  url,
} from 'valibot';

import { MessageEmbedLimits } from './limits/MessageEmbedLimits';

export const MessageEmbedSchema = pipe(
  object({
    title: optional(pipe(string(), maxLength(MessageEmbedLimits.Title))),
    description: optional(
      pipe(string(), maxLength(MessageEmbedLimits.Description)),
    ),
    url: optional(pipe(string(), url())),
    timestamp: optional(string()),
    color: optional(pipe(string(), hexColor())),
    footer: optional(
      object({
        text: pipe(string(), maxLength(MessageEmbedLimits.FooterText)),
        icon: optional(pipe(string(), url())),
      }),
    ),
    image: optional(pipe(string(), url())),
    thumbnail: optional(pipe(string(), url())),
    author: optional(
      object({
        name: pipe(string(), maxLength(MessageEmbedLimits.AuthorName)),
        url: optional(pipe(string(), url())),
        icon: optional(pipe(string(), url())),
      }),
    ),
    fields: optional(
      pipe(
        array(
          object({
            name: pipe(string(), maxLength(MessageEmbedLimits.Fields.Name)),
            value: pipe(string(), maxLength(MessageEmbedLimits.Fields.Value)),
            inline: optional(boolean()),
          }),
        ),
        minLength(1),
        maxLength(MessageEmbedLimits.Fields.Amount),
      ),
    ),
  }),
  // Checked through testing, couldn't find an official documentation
  check((embed) => {
    return !!(
      embed.title ||
      embed.author ||
      embed.description ||
      embed.thumbnail ||
      embed.fields ||
      embed.image ||
      embed.footer
    );
  }, 'An embed needs to have at least a title, an author, a description, a thumbnail, 1 field, an image or a footer.'),
);

export type MessageEmbedSchemaOutput = InferOutput<typeof MessageEmbedSchema>;
