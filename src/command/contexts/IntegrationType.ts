import { ApplicationIntegrationType } from 'discord.js';

export const IntegrationTypeKeys = Object.keys(
  ApplicationIntegrationType,
) as (keyof typeof ApplicationIntegrationType)[];

export type IntegrationTypeKey = (typeof IntegrationTypeKeys)[number];

/**
 * > Defaults to your app's configured contexts.
 * https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure
 *
 * And:
 * > By default, newly-created apps only support installation to guilds.
 * https://discord.com/developers/docs/resources/application#setting-supported-installation-contexts
 */
export const DefaultIntegrationTypes: IntegrationTypeKey[] = ['GuildInstall'];
