import type { EventSubscriber, NyxBot } from '@nyx-discord/core';
import { CommandAutocompleteError } from '@nyx-discord/core';
import { Bot } from '@nyx-discord/framework';
import type { ClientEvents } from 'discord.js';
import {
  Client,
  DiscordAPIError,
  IntentsBitField,
  RESTJSONErrorCodes,
} from 'discord.js';

import type { ConfigWrapper } from '../config/ConfigWrapper';
import type { ContentService } from '../content/ContentService';
import { LogProvider } from '../log/LogProvider';
import { TagReferenceButtonSubscriber } from './events/TagReferenceButtonSubscriber';
import { ResourceAtlasBotManager } from './resource/ResourceAtlasBotManager';
import { ResourceCommandSerializer } from './serializer/ResourceCommandSerializer';
import { TagCategoryCommandSerializer } from './serializer/TagCategoryCommandSerializer';
import { MainTagAtlasBotManager } from './tag/MainTagAtlasBotManager';

export class BotService {
  protected readonly content: ContentService;

  protected readonly config: ConfigWrapper;

  protected readonly bot: NyxBot;

  protected readonly mainTagAtlasManager: MainTagAtlasBotManager;

  protected readonly resourceAtlasManager: ResourceAtlasBotManager;

  protected readonly buttonSubscriber: EventSubscriber<
    ClientEvents,
    keyof ClientEvents
  >;

  constructor(
    content: ContentService,
    config: ConfigWrapper,
    bot: NyxBot,
    mainTagAtlasManager: MainTagAtlasBotManager,
    resourceAtlasManager: ResourceAtlasBotManager,
    buttonSubscriber: EventSubscriber<ClientEvents, keyof ClientEvents>,
  ) {
    this.content = content;
    this.config = config;
    this.bot = bot;
    this.mainTagAtlasManager = mainTagAtlasManager;
    this.resourceAtlasManager = resourceAtlasManager;
    this.buttonSubscriber = buttonSubscriber;
  }

  public static create(
    content: ContentService,
    config: ConfigWrapper,
  ): BotService {
    const client = new Client({
      intents: [IntentsBitField.Flags.Guilds],
      allowedMentions: {
        parse: [],
      },
    });

    const bot = Bot.create(() => ({
      logger: LogProvider.get(),
      id: Symbol('Enki'),
      token: config.getToken(),
      deployCommands: config.getRaw().updateCommands,
      client,
    }));

    const tagCategorySerializer = new TagCategoryCommandSerializer(config);
    const mainTagAtlasBotManager = new MainTagAtlasBotManager(
      content.getMainTagAtlasManager(),
      bot,
      tagCategorySerializer,
    );

    const resourceSerializer = new ResourceCommandSerializer(
      config.getOptions(),
      tagCategorySerializer,
    );
    const resourceAtlasBotManager = new ResourceAtlasBotManager(
      content.getResourceAtlasManager(),
      bot,
      resourceSerializer,
    );

    const buttonSubscriber = new TagReferenceButtonSubscriber(content, config);

    return new BotService(
      content,
      config,
      bot,
      mainTagAtlasBotManager,
      resourceAtlasBotManager,
      buttonSubscriber,
    );
  }

  public async startBot(): Promise<void> {
    await this.mainTagAtlasManager.setupCommands();
    await this.resourceAtlasManager.setupCommands();

    const commandErrorHandler = this.bot
      .getCommandManager()
      .getExecutor()
      .getErrorHandler();

    const logger = LogProvider.get();

    commandErrorHandler.setConsumer(CommandAutocompleteError, (error) => {
      const unwrapped = error.getError();
      if (
        unwrapped instanceof DiscordAPIError &&
        unwrapped.code === RESTJSONErrorCodes.UnknownInteraction
      ) {
        return;
      }

      logger.error(
        `Command "${error.getCause().getName()}" errored while autocompleting: `,
        error,
      );
    });

    commandErrorHandler.setFallbackConsumer((error, command, [interaction]) => {
      if (interaction.isAutocomplete()) return;
      logger.error(
        `Command "${command.getName()}" errored while executing: `,
        error,
      );

      const message = this.config.getGenericError();
      if (interaction.replied || interaction.deferred) {
        interaction.editReply(message).catch(() => {});
        return;
      }

      interaction.reply(message).catch(() => {});
    });

    await this.bot.getEventManager().subscribeClient(this.buttonSubscriber);

    await this.bot.start();
  }

  public async reloadCommands(): Promise<void> {
    const tagAtlasCommands = await this.mainTagAtlasManager.serializeCommands();
    const resourceCommands =
      await this.resourceAtlasManager.serializeCommands();

    const allCommands = [...tagAtlasCommands, ...resourceCommands];

    await this.bot.getCommandManager().setCommands(...allCommands);
  }
}
