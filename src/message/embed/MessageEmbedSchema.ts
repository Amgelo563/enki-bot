import type { InferOutput } from 'valibot';
import {
  array,
  boolean,
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

export const MessageEmbedSchema = object({
  title: pipe(string(), maxLength(MessageEmbedLimits.Title)),
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
});

export type MessageEmbedSchemaOutput = InferOutput<typeof MessageEmbedSchema>;
