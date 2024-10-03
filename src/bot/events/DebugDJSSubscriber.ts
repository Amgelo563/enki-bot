import type { EventDispatchMeta, NyxLogger } from '@nyx-discord/core';
import { AbstractDJSClientSubscriber } from '@nyx-discord/framework';
import { Events } from 'discord.js';

export class DebugDJSSubscriber extends AbstractDJSClientSubscriber<Events.Debug> {
  protected readonly event = Events.Debug;

  protected readonly logger: NyxLogger;

  constructor(logger: NyxLogger) {
    super();
    this.logger = logger;
  }

  public handleEvent(_meta: EventDispatchMeta, message: string): void {
    this.logger.debug('Debug event from DJS client:', message);
  }
}
