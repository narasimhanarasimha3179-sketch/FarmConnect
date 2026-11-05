// FarmConnect Unified Logging Service
import env from '../config/env';

const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

class Logger {
  constructor() {
    this.enabled = env.ENABLE_DEBUG_LOGS;
  }

  _format(level, tag, message, data) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] [${tag}] ${message}`;
  }

  debug(tag, message, data = null) {
    if (this.enabled) {
      const msg = this._format('DEBUG', tag, message);
      data ? console.log(msg, data) : console.log(msg);
    }
  }

  info(tag, message, data = null) {
    const msg = this._format('INFO', tag, message);
    data ? console.info(msg, data) : console.info(msg);
  }

  warn(tag, message, data = null) {
    const msg = this._format('WARN', tag, message);
    data ? console.warn(msg, data) : console.warn(msg);
  }

  error(tag, message, error = null) {
    const msg = this._format('ERROR', tag, message);
    error ? console.error(msg, error) : console.error(msg);
  }
}

export const logger = new Logger();
export default logger;
