import type { Identifiable } from '@nyx-discord/core';
import type { Collection } from 'discord.js';

import type { Resource } from '../Resource';
import type { ResourceCategorySchemaOutput } from './schema/ResourceCategorySchema';

export class ResourceCategory implements Identifiable<string> {
  protected readonly resources: Collection<string, Resource>;

  protected readonly data: ResourceCategorySchemaOutput;

  constructor(
    data: ResourceCategorySchemaOutput,
    resources: Collection<string, Resource>,
  ) {
    this.data = data;
    this.resources = resources;
  }

  public getResource(id: string): Resource | null {
    return this.resources.get(id) ?? null;
  }

  public getResources(): Collection<string, Resource> {
    return this.resources;
  }

  public getRaw(): ResourceCategorySchemaOutput {
    return this.data;
  }

  public getId(): string {
    return this.data.id;
  }
}
