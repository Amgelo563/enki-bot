import type { Identifiable } from '@nyx-discord/core';

import type {
  ApplicationCommandOptionChoiceData,
  BaseMessageOptions,
  Collection,
} from 'discord.js';

import { CommandLimits } from '../command/limits/CommandLimits';
import type { TagSchemaOutput } from './schema/TagSchema';

export class Tag implements Identifiable<string> {
  protected readonly data: TagSchemaOutput;

  protected readonly message: BaseMessageOptions;

  protected readonly variants: Collection<string, BaseMessageOptions>;

  protected readonly variantChoices: ApplicationCommandOptionChoiceData[];

  // Currently messages produced by buttons
  protected readonly customMessages: Collection<string, BaseMessageOptions>;

  constructor(
    data: TagSchemaOutput,
    message: BaseMessageOptions,
    variants: Collection<string, BaseMessageOptions>,
    customMessages: Collection<string, BaseMessageOptions>,
  ) {
    this.data = data;
    this.message = message;
    this.variants = variants;
    this.customMessages = customMessages;
    this.variantChoices = variants.map((_msg, id) => ({
      name: id,
      value: id,
    }));
  }

  public getRaw(): TagSchemaOutput {
    return this.data;
  }

  public getKeywords(): [string, ...string[]] {
    return this.data.keywords;
  }

  public getMessage(): BaseMessageOptions {
    return this.message;
  }

  public hasVariants(): boolean {
    return this.variants.size > 0;
  }

  public getVariant(id: string): BaseMessageOptions | null {
    return this.variants.get(id) ?? null;
  }

  public getVariants(): Collection<string, BaseMessageOptions> {
    return this.variants;
  }

  public getVariantChoices(): ApplicationCommandOptionChoiceData[] {
    return this.variantChoices;
  }

  public getCustomMessage(id: string): BaseMessageOptions | null {
    return this.customMessages.get(id) ?? null;
  }

  public getSummary(maxLength: number): string {
    const { summary } = this.data.message;
    if (summary.length <= maxLength) return summary;

    return summary.slice(0, maxLength - 1) + '…';
  }

  public getLabel(): string {
    const base = `${this.data.displayName} - `;
    return `${base}${this.getSummary(CommandLimits.Autocomplete.Name - base.length)}`;
  }

  public getId() {
    return this.data.id;
  }
}
