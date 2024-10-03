import type { NyxLogger } from '@nyx-discord/core';
// @ts-expect-error tslog doesn't support cjs, see https://github.com/fullstack-build/tslog/issues/267
import { Logger } from 'tslog';

export class LogProvider {
  protected static Instance: Logger<void> | null = null;

  public static get(): NyxLogger {
    if (!this.Instance) {
      this.Instance = new Logger({ type: 'pretty' });
    }

    return this.Instance;
  }

  public static setDebug(debug: boolean): void {
    const logger = LogProvider.Instance as Logger<void>;
    logger.settings.minLevel = debug ? 3 : 1;
  }
}
