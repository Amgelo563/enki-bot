import type { ApplicationCommandOptionChoiceData } from 'discord.js';

import type { TagSearchData } from '../data/TagSearchData';

export interface TagSearcher {
  search(query: string): ApplicationCommandOptionChoiceData[];

  addTags(docs: TagSearchData): void;
}
