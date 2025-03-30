import * as winston from 'winston';

/** 
 * loggerOptions is a configuration object for the Winston logger.
 * It specifies the transports (where the logs will be sent),
 * the log file name, the log level, and the format of the logs.
 */
export const loggerOptions = {
  /**
   * The transports array defines where the logs will be sent.
   * In this case, logs will be sent to a file and the console.
   */
  transports: [
    new winston.transports.File({
      filename: 'logs/app.log',
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
};
