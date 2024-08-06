import { AssertionError } from '@nyx-discord/core';
import { statSync } from 'fs';
import path from 'node:path';

import { PathBuilder } from './PathBuilder';

export class PathsManager {
  protected readonly root: string;

  protected readonly contentRoot: string;

  constructor(root: string, contentFolder: string) {
    this.root = root;
    this.contentRoot = contentFolder;

    if (!statSync(root).isDirectory()) {
      throw new AssertionError('Root must be a directory, received ' + root);
    }
    if (!statSync(contentFolder).isDirectory()) {
      throw new AssertionError(
        'Content root must be a directory, received ' + contentFolder,
      );
    }
  }

  public checkFile(absolutePath: string): boolean {
    try {
      return statSync(absolutePath).isFile();
    } catch {
      return false;
    }
  }

  public appendRoot(appended: string): string {
    return path.join(this.root, appended);
  }

  public appendContentRoot(appended: string): string {
    return path.join(this.contentRoot, appended);
  }

  public join(...paths: string[]): string {
    return path.join(...paths);
  }

  public getBuilderFromRoot(): PathBuilder {
    return new PathBuilder(this.root);
  }

  public getBuilderFromContentRoot(): PathBuilder {
    return new PathBuilder(this.contentRoot);
  }

  public getRoot(): string {
    return this.root;
  }

  public getContentRoot(): string {
    return this.contentRoot;
  }
}
