import type { NyxBot, ParentCommand, TopLevelCommand } from '@nyx-discord/core';
import { IllegalStateError } from '@nyx-discord/core';

import type { ResourceAtlasManager } from '../../resource/atlas/ResourceAtlasManager';
import type { ResourceCommandSerializer } from '../serializer/ResourceCommandSerializer';

export class ResourceAtlasBotManager {
  protected readonly manager: ResourceAtlasManager;

  protected readonly bot: NyxBot;

  protected readonly serializer: ResourceCommandSerializer;

  constructor(
    manager: ResourceAtlasManager,
    bot: NyxBot,
    serializer: ResourceCommandSerializer,
  ) {
    this.manager = manager;
    this.bot = bot;
    this.serializer = serializer;
  }

  public async setupCommands(): Promise<void> {
    const commands = await this.serializeCommands();
    await this.bot.getCommandManager().addCommands(...commands);
  }

  public async serializeCommands(): Promise<TopLevelCommand[]> {
    const resources = this.manager.getResources();
    if (!resources) {
      throw new IllegalStateError();
    }

    const commands: ParentCommand[] = [];
    for (const resource of resources.values()) {
      const command = this.serializer.toParentCommand(resource);
      commands.push(command);
    }

    return commands;
  }
}
