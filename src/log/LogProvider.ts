import type { NyxLogger } from '@nyx-discord/core';
// @ts-expect-error tslog doesn't support cjs, see https://github.com/fullstack-build/tslog/issues/267
import { Logger } from 'tslog';

export class LogProvider {
  protected static instance: NyxLogger | null = null;

  public static get(): NyxLogger {
    if (!this.instance) {
      this.instance = new Logger({ type: 'pretty' });
    }

    return this.instance;
  }
}
