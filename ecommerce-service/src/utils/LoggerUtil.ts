import pino, { Logger } from 'pino';

const baseConfig = {
  name: process.env.SERVICE || 'unknown',
  level: process.env.LOG_LEVEL || 'info',
};

let logger: Logger<never>;

export const getLogger = () => logger || pino(baseConfig);

export const resetLogger = () => {
  getLogger().debug('Reset logger');
  logger = pino(baseConfig);
};

export const setLogger = (newLogger: Logger<never>) => {
  getLogger().debug('Setting logger');
  logger = newLogger;
};
