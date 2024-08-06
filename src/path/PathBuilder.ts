import { sep } from 'path';

export class PathBuilder {
  protected static readonly Separator = sep;

  protected segments: string[];

  constructor(root: string) {
    this.segments = [root];
  }

  public static fromPath(path: string): PathBuilder {
    const segments = path.split(PathBuilder.Separator);

    return new PathBuilder(segments[0]).add(...segments.slice(1));
  }

  public add(...segments: string[]): PathBuilder {
    this.segments.push(...segments);
    return this;
  }

  public addPath(path: string): PathBuilder {
    const segments = path.split(PathBuilder.Separator);
    this.segments.push(...segments);
    return this;
  }

  public build(): string {
    return this.segments.join(PathBuilder.Separator);
  }

  public merge(other: PathBuilder): PathBuilder {
    this.segments.push(...other.segments);
    return this;
  }

  public set(path: string): PathBuilder {
    this.segments = [path];
    return this;
  }

  public clone(): PathBuilder {
    const builder = new PathBuilder(this.segments[0]);
    builder.segments.push(...this.segments.slice(1));
    return builder;
  }
}
