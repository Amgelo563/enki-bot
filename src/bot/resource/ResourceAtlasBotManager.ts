import type { NyxBot, ParentCommand } from '@nyx-discord/core';
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

  public async start(): Promise<void> {
    const resources = this.manager.getResources();
    if (!resources) {
      throw new IllegalStateError();
    }

    const commands: ParentCommand[] = [];
    for (const resource of resources.values()) {
      const command = this.serializer.toParentCommand(resource);
      commands.push(command);
    }

    await this.bot.getCommandManager().addCommands(...commands);
  }
}
