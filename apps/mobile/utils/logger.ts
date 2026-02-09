/**
 * Logger Utility
 *
 * Wraps console.* so logs can be:
 * - Silenced in production builds
 * - Prefixed with tags
 * - Easily swapped to a remote logging service later
 */

const IS_DEV = __DEV__;

function formatMsg(tag: string, msg: string): string {
  return `[${tag}] ${msg}`;
}

export const logger = {
  /** General log — silenced in prod. Drop-in replacement for console.log */
  log(...args: unknown[]): void {
    if (IS_DEV) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  },

  debug(tag: string, msg: string, ...args: unknown[]): void {
    if (IS_DEV) {
      // eslint-disable-next-line no-console
      console.log(formatMsg(tag, msg), ...args);
    }
  },

  info(tag: string, msg: string, ...args: unknown[]): void {
    if (IS_DEV) {
      // eslint-disable-next-line no-console
      console.info(formatMsg(tag, msg), ...args);
    }
  },

  warn(...args: unknown[]): void {
    if (IS_DEV) {
      // eslint-disable-next-line no-console
      console.warn(...args);
    }
  },

  error(...args: unknown[]): void {
    if (IS_DEV) {
      // In dev: use console.warn to avoid red screen overlay
      // console.error triggers React Native's LogBox red screen
      // eslint-disable-next-line no-console
      console.warn('[ERROR]', ...args);
    } else {
      // In prod: use console.error for crash reporting services
      // eslint-disable-next-line no-console
      console.error(...args);
    }
  },

  /** Network requests — silenced in prod */
  api(method: string, url: string, status?: number): void {
    if (IS_DEV) {
      const statusStr = status ? ` → ${status}` : '';
      // eslint-disable-next-line no-console
      console.log(`🌐 ${method} ${url}${statusStr}`);
    }
  },

  /** Auth events */
  auth(msg: string): void {
    if (IS_DEV) {
      // eslint-disable-next-line no-console
      console.log(`🔐 ${msg}`);
    }
  },
};
