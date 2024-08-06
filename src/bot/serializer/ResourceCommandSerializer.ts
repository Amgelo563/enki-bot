import type { ParentCommand, SubCommand } from '@nyx-discord/core';
import {
  AbstractParentCommand,
  AbstractSubCommand,
} from '@nyx-discord/framework';
import type { SlashCommandSubcommandsOnlyBuilder } from 'discord.js';
import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import type { CommandSchemaOutput } from '../../command/CommandSchema';
import type { ConfigCommandOptionsSchemaOutput } from '../../config/command/ConfigCommandOptionsSchema';
import type { Resource } from '../../resource/Resource';
import type { Tag } from '../../tag/Tag';
import { BaseContentCommandSerializer } from './BaseContentCommandSerializer';
import type { TagCategoryCommandSerializer } from './TagCategoryCommandSerializer';

export class ResourceCommandSerializer extends BaseContentCommandSerializer {
  protected readonly categorySerializer: TagCategoryCommandSerializer;

  constructor(
    configOptions: ConfigCommandOptionsSchemaOutput,
    categorySerializer: TagCategoryCommandSerializer,
  ) {
    super(configOptions);
    this.categorySerializer = categorySerializer;
  }

  public toParentCommand(resource: Resource): ParentCommand {
    const toLocalizationMaps = this.toLocalizationMaps.bind(this);

    const ResourceParentCommandClass = class extends AbstractParentCommand {
      protected createData(): SlashCommandSubcommandsOnlyBuilder {
        const command = resource.getRaw().command;

        const builder = new SlashCommandBuilder()
          .setName(command.name)
          .setDescription(command.description);

        const optionMaps = toLocalizationMaps(command);
        if (optionMaps) {
          builder
            .setNameLocalizations(optionMaps.name)
            .setDescriptionLocalizations(optionMaps.description);
        }

        return builder;
      }
    };

    const parent = new ResourceParentCommandClass();

    for (const tag of resource.getTags().values()) {
      parent.addChildren(this.encodeTag(parent, tag));
    }

    for (const category of resource.getTagCategories().values()) {
      parent.addChildren(
        this.categorySerializer.toSubCommand(parent, category),
      );
    }

    return parent;
  }

  protected encodeTag(parent: ParentCommand, tag: Tag): SubCommand {
    const builderFiller = this.fillBuilderWithConfigOptions.bind(this);
    const tagExecutor = this.tagExecutor.bind(this, tag);

    const TagSubCommandClass = class extends AbstractSubCommand {
      public execute = tagExecutor;

      protected createData(): SlashCommandSubcommandBuilder {
        const command = tag.getRaw().command as CommandSchemaOutput;
        const builder = new SlashCommandSubcommandBuilder()
          .setName(command.name)
          .setDescription(command.description);

        return builderFiller(builder, tag);
      }
    };

    return new TagSubCommandClass(parent);
  }
}
