import type { ApplicationCommandOptionChoiceData } from 'discord.js';
import { type Collection } from 'discord.js';
import MiniSearch from 'minisearch';
import { CommandLimits } from '../../../command/limits/CommandLimits';
import type { TagCategorySchemaOutput } from '../../category/schema/TagCategorySchema';
import type { Tag } from '../../Tag';
import type { TagSearchData } from '../data/TagSearchData';
import type { TagSearcher } from './TagSearcher';

export class MiniSearchSearcher implements TagSearcher {
  protected readonly miniSearch: MiniSearch<TagSearchData>;

  protected readonly emptyChoices: ApplicationCommandOptionChoiceData[];

  constructor(
    miniSearch: MiniSearch<TagSearchData>,
    emptyChoices: ApplicationCommandOptionChoiceData[],
  ) {
    this.miniSearch = miniSearch;
    this.emptyChoices = emptyChoices;
  }

  public static create(
    data: TagCategorySchemaOutput,
    tags: Collection<string, Tag>,
  ): TagSearcher {
    const fields = ['keywords'];
    const { searchBy } = data;

    if (searchBy.content) {
      fields.push('content');
    }
    if (searchBy.embeds) {
      fields.push('embeds');
    }

    const miniSearch = new MiniSearch<TagSearchData>({
      fields,
      storeFields: ['id', 'label'],
    });

    const searchDatas = tags.map((tag) => {
      const id = tag.getId();
      const data = tag.getRaw();
      const keywords = data.keywords.join(' ');

      const { message } = data;
      const content = message.content ? message.content : '';
      const embeds = (message.embeds ? message.embeds : [])
        .map((embed) => `${embed.title} ${embed.description ?? ''}`)
        .join(' | ');

      const label = tag.getLabel();

      return {
        id,
        label,
        keywords,
        content,
        embeds,
      };
    });

    miniSearch.addAll(searchDatas);

    const emptyOptions = searchDatas
      .slice(0, CommandLimits.Autocomplete.Amount)
      .map((data) => ({
        name: data.label,
        value: data.id,
      }));

    return new MiniSearchSearcher(miniSearch, emptyOptions);
  }

  public search(query: string): ApplicationCommandOptionChoiceData[] {
    if (query === '') {
      return this.emptyChoices;
    }

    const results = this.miniSearch.search(query, { prefix: true });
    return results.map((result) => {
      return {
        name: result.label as string,
        value: result.id as string,
      };
    });
  }

  public addTags(docs: TagSearchData) {
    this.miniSearch.add(docs);
  }
}
