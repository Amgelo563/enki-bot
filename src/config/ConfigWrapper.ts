import type {
  ApplicationIntegrationType,
  BaseMessageOptions,
  InteractionContextType,
} from 'discord.js';

import type { ConfigCommandOptionsSchemaOutput } from './command/ConfigCommandOptionsSchema';
import type { ConfigErrorsSchemaOutput } from './errors/ConfigErrorsSchema';
import type { ConfigSchemaOutput } from './schema/ConfigSchema';

export class ConfigWrapper {
  protected readonly config: ConfigSchemaOutput;

  protected readonly errors: Record<
    keyof ConfigErrorsSchemaOutput,
    BaseMessageOptions
  >;

  constructor(
    config: ConfigSchemaOutput,
    errors: Record<keyof ConfigErrorsSchemaOutput, BaseMessageOptions>,
  ) {
    this.config = config;
    this.errors = errors;
  }

  public getTagNotFoundError(): BaseMessageOptions {
    return this.errors.tagNotFound;
  }

  public getGenericError(): BaseMessageOptions {
    return this.errors.generic;
  }

  public getToken(): string {
    return this.config.token;
  }

  public getOptions(): ConfigCommandOptionsSchemaOutput {
    return this.config.options;
  }

  public isDebug(): boolean {
    return this.config.debug;
  }

  public getDefaultIntegrationTypes(): ApplicationIntegrationType[] {
    return this.config.defaultIntegrations;
  }

  public getDefaultInteractionContexts(): InteractionContextType[] {
    return this.config.defaultContexts;
  }

  public getRaw(): ConfigSchemaOutput {
    return this.config;
  }
}
