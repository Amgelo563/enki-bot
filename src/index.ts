import type { NyxLogger } from '@nyx-discord/core';
import { ObjectNotFoundError } from '@nyx-discord/core';
import { NotImplementedError } from '@nyx-discord/framework';
import type { BaseMessageOptions } from 'discord.js';
import { statSync } from 'fs';
import goGitIt from 'go-git-it';
import { existsSync, rmSync } from 'node:fs';
import { join as joinPath } from 'node:path';

import { BotService } from './bot/BotService';
import { ConfigWrapper } from './config/ConfigWrapper';
import type { ConfigErrorsSchemaOutput } from './config/errors/ConfigErrorsSchema';
import type { ConfigSchemaOutput } from './config/schema/ConfigSchema';
import { ConfigSchema } from './config/schema/ConfigSchema';
import { ConfigSourceType } from './config/type/ConfigSourceType';
import { ContentService } from './content/ContentService';
import { FileReader } from './file/FileReader';
import { LogProvider } from './log/LogProvider';
import type { MessageSerializer } from './message/serializer/MessageSerializer';
import { PathsManager } from './path/PathsManager';

class EnkiBootstrap {
  public static readonly RootPath = joinPath(__dirname, '..');

  public async start(): Promise<void> {
    const logger = LogProvider.get();
    logger.info('Starting...');
    const config = await this.loadConfig();
    logger.info('Config loaded');

    if (config.debug) {
      LogProvider.setDebug(true);
      logger.info('Debug mode set');
    }

    const contentPath = await this.loadContentPath(config, logger);
    logger.info(`Content path loaded as ${contentPath}`);

    const pathManager = new PathsManager(EnkiBootstrap.RootPath, contentPath);

    const contentService = ContentService.create(pathManager);
    logger.info('Loading content...');
    await contentService.loadContent();
    logger.info('Content loaded');

    if (process.argv.includes('--parse-only')) {
      logger.info('Parse only mode set, exiting...');
      return;
    }

    const wrappedConfig = this.wrapConfig(
      config,
      contentService.getMessageSerializer(),
    );
    const botService = BotService.create(contentService, wrappedConfig);

    logger.info('Parse only mode not set (--parse-only flag), starting bot...');
    await botService.startBot();
    logger.info('Bot started');
  }

  protected async loadConfig(): Promise<ConfigSchemaOutput> {
    const reader = new FileReader('config.conf', ConfigSchema);
    return reader.read();
  }

  protected async loadContentPath(
    config: ConfigSchemaOutput,
    logger: NyxLogger,
  ): Promise<string> {
    const { source } = config;

    switch (source.type) {
      case ConfigSourceType.Local: {
        logger.info(
          `Config source is local, loading content from local path '${source.contentFolder}'...`,
        );
        const absolutePath = joinPath(__dirname, '..', source.contentFolder);
        this.checkContentPath(absolutePath);
        return absolutePath;
      }

      case ConfigSourceType.Git: {
        const clonePath = joinPath(__dirname, '..', source.cloneFolder);
        const repoPath = joinPath(clonePath, source.repoName);

        logger.info(
          `Config source is git, cloning repository '${source.gitUrl}' to folder '${clonePath}', result will be stored in '${repoPath}'...`,
        );

        if (existsSync(repoPath)) {
          logger.info(`Folder at ${repoPath} already exists, deleting...`);
          rmSync(repoPath, { recursive: true, force: true });
        }

        try {
          await goGitIt(source.gitUrl, clonePath);
        } catch (e) {
          throw new ObjectNotFoundError(
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            `Failed to clone repository: ${source.gitUrl}. Error: ${e}`,
          );
        }

        const contentPath = source.contentFolder
          ? joinPath(repoPath, source.contentFolder)
          : repoPath;
        this.checkContentPath(contentPath);

        return contentPath;
      }

      default: {
        throw new NotImplementedError(
          // @ts-expect-error Currently source is narrowed to `never`, intended to error if all types are covered.
          // Ideally we should only expect the TS2339 error, but https://github.com/microsoft/TypeScript/issues/19139 ¯\_(ツ)_/¯
          `Unknown config source type: ${source.type}`,
        );
      }
    }
  }

  protected checkContentPath(path: string): void {
    let stat;
    try {
      stat = statSync(path);
    } catch (e) {
      throw new ObjectNotFoundError(`Content folder not found: ${path}`);
    }

    if (!stat.isDirectory()) {
      throw new ObjectNotFoundError(
        `Content folder not found: ${path}, found a file instead.`,
      );
    }
  }

  protected wrapConfig(
    config: ConfigSchemaOutput,
    messageSerializer: MessageSerializer,
  ): ConfigWrapper {
    const errors: Record<keyof ConfigErrorsSchemaOutput, BaseMessageOptions> = {
      tagNotFound: messageSerializer.serializeWithoutButtons(
        config.errors.tagNotFound,
        EnkiBootstrap.RootPath,
      ),
      generic: messageSerializer.serializeWithoutButtons(
        config.errors.generic,
        EnkiBootstrap.RootPath,
      ),
    };

    return new ConfigWrapper(config, errors);
  }
}

const enkiBootstrap = new EnkiBootstrap();
void enkiBootstrap.start();
