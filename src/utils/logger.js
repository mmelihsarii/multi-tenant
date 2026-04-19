/**
 * Development Logger
 * Production'da console.log'ları devre dışı bırakır
 */

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

/**
 * Log levels
 */
const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
};

/**
 * Log level colors (for console)
 */
const LOG_COLORS = {
  [LOG_LEVELS.ERROR]: '\x1b[31m', // Red
  [LOG_LEVELS.WARN]: '\x1b[33m', // Yellow
  [LOG_LEVELS.INFO]: '\x1b[36m', // Cyan
  [LOG_LEVELS.DEBUG]: '\x1b[35m', // Magenta
};

const RESET_COLOR = '\x1b[0m';

/**
 * Format log message
 */
const formatMessage = (level, message, data) => {
  const timestamp = new Date().toISOString();
  const color = LOG_COLORS[level] || '';

  if (isDevelopment) {
    return {
      formatted: `${color}[${timestamp}] [${level.toUpperCase()}]${RESET_COLOR}`,
      message,
      data,
    };
  }

  return {
    timestamp,
    level,
    message,
    data,
  };
};

/**
 * Logger class
 */
class Logger {
  constructor(context = 'App') {
    this.context = context;
  }

  /**
   * Error log (always enabled)
   */
  error(message, data = null) {
    const formatted = formatMessage(LOG_LEVELS.ERROR, message, data);

    if (isDevelopment) {
      console.error(formatted.formatted, formatted.message, formatted.data || '');
    } else {
      // Production'da error tracking servisine gönder
      // Sentry.captureException(new Error(message), { extra: data });
      console.error(formatted);
    }
  }

  /**
   * Warning log (always enabled)
   */
  warn(message, data = null) {
    const formatted = formatMessage(LOG_LEVELS.WARN, message, data);

    if (isDevelopment) {
      console.warn(formatted.formatted, formatted.message, formatted.data || '');
    } else {
      console.warn(formatted);
    }
  }

  /**
   * Info log (development only)
   */
  info(message, data = null) {
    if (!isDevelopment) return;

    const formatted = formatMessage(LOG_LEVELS.INFO, message, data);
    console.info(formatted.formatted, formatted.message, formatted.data || '');
  }

  /**
   * Debug log (development only)
   */
  debug(message, data = null) {
    if (!isDevelopment) return;

    const formatted = formatMessage(LOG_LEVELS.DEBUG, message, data);
    console.log(formatted.formatted, formatted.message, formatted.data || '');
  }

  /**
   * Log (development only - alias for debug)
   */
  log(message, data = null) {
    this.debug(message, data);
  }

  /**
   * Group logs (development only)
   */
  group(label) {
    if (!isDevelopment) return;
    console.group(label);
  }

  groupEnd() {
    if (!isDevelopment) return;
    console.groupEnd();
  }

  /**
   * Table log (development only)
   */
  table(data) {
    if (!isDevelopment) return;
    console.table(data);
  }

  /**
   * Time measurement
   */
  time(label) {
    if (!isDevelopment) return;
    console.time(label);
  }

  timeEnd(label) {
    if (!isDevelopment) return;
    console.timeEnd(label);
  }

  /**
   * Create child logger with context
   */
  child(context) {
    return new Logger(`${this.context}:${context}`);
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger();

/**
 * Create logger with context
 */
export const createLogger = (context) => new Logger(context);

/**
 * Legacy console replacement (for gradual migration)
 */
export const console = isProduction
  ? {
      log: () => {},
      debug: () => {},
      info: () => {},
      warn: logger.warn.bind(logger),
      error: logger.error.bind(logger),
      group: () => {},
      groupEnd: () => {},
      table: () => {},
      time: () => {},
      timeEnd: () => {},
    }
  : window.console;

export default logger;
