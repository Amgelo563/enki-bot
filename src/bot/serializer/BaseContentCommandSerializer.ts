import type {
  ApplicationIntegrationType,
  ChatInputCommandInteraction,
  InteractionContextType,
  Locale,
  LocalizationMap,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from 'discord.js';

import type { CommandOptionSchema } from '../../command/CommandOptionSchema';
import type {
  CommandSchema,
  CommandSchemaOutput,
} from '../../command/CommandSchema';
import type { ConfigCommandOptionsSchemaOutput } from '../../config/command/ConfigCommandOptionsSchema';
import type { ConfigWrapper } from '../../config/ConfigWrapper';
import type { LocalizableSchemaOutput } from '../../schemas/LocalizableSchema';
import type { TagCategory } from '../../tag/category/TagCategory';
import type { Tag } from '../../tag/Tag';

export class BaseContentCommandSerializer {
  protected readonly defaultIntegrations: ApplicationIntegrationType[];

  protected readonly defaultContexts: InteractionContextType[];

  protected readonly configOptions: ConfigCommandOptionsSchemaOutput;

  constructor(config: ConfigWrapper) {
    this.defaultIntegrations = config.getDefaultIntegrationTypes();
    this.defaultContexts = config.getDefaultInteractionContexts();
    this.configOptions = config.getOptions();
  }

  protected fillBuilderWithConfigOptions<
    Builder extends SlashCommandSubcommandBuilder | SlashCommandBuilder,
  >(builder: Builder, categoryOrTag: TagCategory | Tag): Builder {
    const data = categoryOrTag.getRaw();

    if (data.command) {
      const optionMaps = this.toLocalizationMaps(data.command);
      if (optionMaps) {
        builder
          .setNameLocalizations(optionMaps.name)
          .setDescriptionLocalizations(optionMaps.description);
      }
    }

    if (categoryOrTag.hasVariants()) {
      builder.addStringOption((variantBuilder) => {
        const option = this.configOptions.variant;

        variantBuilder
          .setName(option.name)
          .setDescription(option.description)
          .setRequired(false)
          .setAutocomplete(true);

        const optionMaps = this.toLocalizationMaps(option);
        if (optionMaps) {
          variantBuilder
            .setNameLocalizations(optionMaps.name)
            .setDescriptionLocalizations(optionMaps.description);
        }

        return variantBuilder;
      });
    }

    builder.addBooleanOption((hideBuilder) => {
      const option = this.configOptions.hide;
      hideBuilder
        .setName(option.name)
        .setDescription(option.description)
        .setRequired(false);

      const optionMaps = this.toLocalizationMaps(option);
      if (optionMaps) {
        hideBuilder
          .setNameLocalizations(optionMaps.name)
          .setDescriptionLocalizations(optionMaps.description);
      }
      return hideBuilder;
    });

    return builder;
  }

  protected toLocalizationMaps(
    localizable: LocalizableSchemaOutput<
      typeof CommandSchema | typeof CommandOptionSchema
    >,
  ): { name: LocalizationMap; description: LocalizationMap } | null {
    if (!localizable.locale) return null;

    const nameLocalizations: LocalizationMap = {};
    const descriptionLocalizations: LocalizationMap = {};

    for (const [locale, data] of Object.entries(localizable.locale ?? {}) as [
      Locale,
      CommandSchemaOutput,
    ][]) {
      nameLocalizations[locale] = data.name;
      descriptionLocalizations[locale] = data.description;
    }

    return { name: nameLocalizations, description: descriptionLocalizations };
  }

  protected async tagExecutor(
    this: BaseContentCommandSerializer,
    tag: Tag,
    interaction: ChatInputCommandInteraction,
  ): Promise<void> {
    const ephemeral =
      interaction.options.getBoolean(this.configOptions.hide.name) ?? false;

    if (tag.hasVariants()) {
      const selectedVariant = interaction.options.getString(
        this.configOptions.variant.name,
      );
      const variant = tag.getVariant(selectedVariant ?? '');

      if (!variant) {
        await interaction.reply({ ...tag.getMessage(), ephemeral });
        return;
      }

      await interaction.reply({ ...variant, ephemeral });
    }

    await interaction.reply({ ...tag.getMessage(), ephemeral });
    return;
  }

  protected fillBuilderWithContexts(
    command: CommandSchemaOutput,
    builder: SlashCommandBuilder,
  ): SlashCommandBuilder {
    const integrationTypes =
      command.integrationTypes ?? this.defaultIntegrations;
    builder.setIntegrationTypes(integrationTypes);

    const interactionContexts =
      command.interactionContexts ?? this.defaultContexts;
    builder.setContexts(interactionContexts);

    return builder;
  }
}
