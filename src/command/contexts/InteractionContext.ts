import { InteractionContextType } from 'discord.js';

export const InteractionContextKeys = Object.keys(
  InteractionContextType,
) as (keyof typeof InteractionContextType)[];

export type InteractionContextKey = (typeof InteractionContextKeys)[number];

/**
 * > By default, contexts includes all interaction context types.
 * https://discord.com/developers/docs/interactions/application-commands#interaction-contexts
 */
export const DefaultInteractionContexts: InteractionContextKey[] = [
  'Guild',
  'BotDM',
  'PrivateChannel',
];
