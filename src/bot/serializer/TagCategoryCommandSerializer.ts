import type {
  ParentCommand,
  StandaloneCommand,
  SubCommand,
} from '@nyx-discord/core';
import {
  AbstractStandaloneCommand,
  AbstractSubCommand,
} from '@nyx-discord/framework';
import type {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandOptionsOnlyBuilder,
} from 'discord.js';
import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import type { CommandSchemaOutput } from '../../command/CommandSchema';
import { CommandLimits } from '../../command/limits/CommandLimits';
import type { ConfigWrapper } from '../../config/ConfigWrapper';
import type { TagCategory } from '../../tag/category/TagCategory';
import { BaseContentCommandSerializer } from './BaseContentCommandSerializer';

// This could probably be rewritten with mixins, but for now it's unnecessary complexity
export class TagCategoryCommandSerializer extends BaseContentCommandSerializer {
  protected readonly config: ConfigWrapper;

  constructor(config: ConfigWrapper) {
    super(config.getOptions());
    this.config = config;
  }

  public toStandaloneCommand(category: TagCategory): StandaloneCommand[] {
    // Intended, instantiation expressions only work on direct values. Binding is done next in the dataFactory const.
    // See: https://github.com/microsoft/TypeScript/issues/52035
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const _unboundBuilder = this.fillBuilder<SlashCommandBuilder>;

    const dataFactory = _unboundBuilder.bind(
      this,
      () => new SlashCommandBuilder(),
      category,
    );

    const executor = this.executor.bind(this, category);
    const autocompleter = this.categoryAutocompleter.bind(this, category);

    const CategoryCommandClass = class extends AbstractStandaloneCommand {
      public execute = executor;

      public createData = dataFactory;

      public autocomplete = autocompleter;
    };

    const categoryStandalone = new CategoryCommandClass();
    const tagsWithCommands = [...category.getTags().values()].filter(
      (tag) => !!tag.getRaw().command,
    );

    const standaloneCommands: StandaloneCommand[] = [categoryStandalone];

    if (!tagsWithCommands.length) return standaloneCommands;

    for (const tag of tagsWithCommands) {
      const command = tag.getRaw().command as CommandSchemaOutput;
      const tagExecutor = this.tagExecutor.bind(this, tag);
      const builderFiller = this.fillBuilderWithConfigOptions.bind(this);

      const TagCommandClass = class extends AbstractStandaloneCommand {
        public execute = tagExecutor;

        protected createData(): SlashCommandOptionsOnlyBuilder {
          const builder = new SlashCommandBuilder()
            .setName(command.name)
            .setDescription(command.description);

          return builderFiller(builder, tag);
        }
      };

      const tagStandalone = new TagCommandClass();
      standaloneCommands.push(tagStandalone);
    }

    return standaloneCommands;
  }

  public toSubCommand(
    parent: ParentCommand,
    category: TagCategory,
  ): SubCommand {
    // Intended, instantiation expressions only work on direct values. Binding is done next in the dataFactory const.
    // See: https://github.com/microsoft/TypeScript/issues/52035
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const _unboundBuilder = this.fillBuilder<SlashCommandSubcommandBuilder>;

    const dataFactory = _unboundBuilder.bind(
      this,
      () => new SlashCommandSubcommandBuilder(),
      category,
    );

    const executor = this.executor.bind(this, category);
    const autocompleter = this.categoryAutocompleter.bind(this, category);

    const SubCommandClass = class extends AbstractSubCommand {
      public execute = executor;

      public createData = dataFactory;

      public autocomplete = autocompleter;
    };

    return new SubCommandClass(parent);
  }

  protected fillBuilder<
    Builder extends SlashCommandSubcommandBuilder | SlashCommandBuilder,
  >(
    this: TagCategoryCommandSerializer,
    builderFactory: () => Builder,
    category: TagCategory,
  ): Builder {
    const builder = builderFactory();
    const data = category.getCommand();

    builder
      .setName(data.name)
      .setDescription(data.description)
      .addStringOption((tagBuilder) => {
        const option = data.options.tag;
        const required = !category.getMessage();

        tagBuilder
          .setName(option.name)
          .setDescription(option.description)
          .setRequired(required)
          .setAutocomplete(true);

        const optionMaps = this.toLocalizationMaps(option);
        if (optionMaps) {
          tagBuilder
            .setNameLocalizations(optionMaps.name)
            .setDescriptionLocalizations(optionMaps.description);
        }

        return tagBuilder;
      });

    return this.fillBuilderWithConfigOptions(builder, category);
  }

  protected async executor(
    this: TagCategoryCommandSerializer,
    category: TagCategory,
    interaction: ChatInputCommandInteraction,
  ): Promise<void> {
    const tagOption = category.getTagOption().name;
    const selected = interaction.options.getString(tagOption);
    const ephemeral =
      interaction.options.getBoolean(this.configOptions.hide.name) ?? false;

    if (!selected) {
      const categoryMessage = category.getMessage();
      if (!categoryMessage) {
        await interaction.reply({
          ...this.config.getTagNotFoundError(),
          ephemeral: true,
        });
      }

      await interaction.reply({ ...categoryMessage, ephemeral });
      return;
    }

    const tag = category.getTag(selected);
    if (!tag) {
      await interaction.reply({
        ...this.config.getTagNotFoundError(),
        ephemeral: true,
      });
      return;
    }

    await this.tagExecutor(tag, interaction);
  }

  protected async categoryAutocompleter(
    category: TagCategory,
    interaction: AutocompleteInteraction,
  ): Promise<void> {
    const focused = interaction.options.getFocused(true);

    if (focused.name === this.configOptions.variant.name) {
      const tag = category.getTag(focused.value);
      if (!tag) return interaction.respond([]);

      const choices = tag.getVariantChoices();
      const typedChoices = choices
        .filter((choice) => choice.name.startsWith(focused.value))
        .slice(0, CommandLimits.Autocomplete.Amount);

      await interaction.respond(typedChoices);
      return;
    }

    const options = category.search(focused.value);
    await interaction.respond(options);
  }
}
