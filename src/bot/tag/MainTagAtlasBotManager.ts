import type {
  NyxBot,
  StandaloneCommand,
  TopLevelCommand,
} from '@nyx-discord/core';
import { IllegalStateError } from '@nyx-discord/core';

import type { MainTagAtlasManager } from '../../tag/atlas/MainTagAtlasManager';
import type { TagCategoryCommandSerializer } from '../serializer/TagCategoryCommandSerializer';

export class MainTagAtlasBotManager {
  protected readonly manager: MainTagAtlasManager;

  protected readonly bot: NyxBot;

  protected readonly serializer: TagCategoryCommandSerializer;

  constructor(
    manager: MainTagAtlasManager,
    bot: NyxBot,
    serializer: TagCategoryCommandSerializer,
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
    const categories = this.manager.getCategories();
    if (!categories) {
      throw new IllegalStateError();
    }

    const commands: StandaloneCommand[] = [];
    for (const category of categories.values()) {
      const standaloneCommands = this.serializer.toStandaloneCommand(category);
      commands.push(...standaloneCommands);
    }

    return commands;
  }
}
