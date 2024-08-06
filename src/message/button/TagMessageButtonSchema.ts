import type { InferOutput } from 'valibot';
import { lazy, literal, minLength, object, pipe, url, variant } from 'valibot';

import { NonEmptyStringSchema } from '../../schemas/NonEmptyStringSchema';
import { TagReferenceSchema } from '../../tag/reference/TagReferenceSchema';
import { EnkiMessageComponentType } from '../component/EnkiMessageComponentType';
import { MessageSchemaWithoutButtons } from '../schema/MessageSchema';
import {
  LinkMessageButtonSchema,
  NonLinkMessageButtonSchema,
} from './base/NonLinkMessageButtonSchema';

export const TagMessageButtonSchema = variant('type', [
  object({
    ...NonLinkMessageButtonSchema.entries,

    type: literal(EnkiMessageComponentType.Message),
    id: pipe(NonEmptyStringSchema, minLength(1)),
    message: lazy(() => MessageSchemaWithoutButtons),
  }),
  object({
    ...LinkMessageButtonSchema.entries,

    type: literal(EnkiMessageComponentType.Url),
    url: pipe(NonEmptyStringSchema, url()),
  }),
  object({
    ...NonLinkMessageButtonSchema.entries,

    type: literal(EnkiMessageComponentType.Tag),
    tag: TagReferenceSchema,
  }),
]);

export type TagMessageButtonSchemaOutput = InferOutput<
  typeof TagMessageButtonSchema
>;
