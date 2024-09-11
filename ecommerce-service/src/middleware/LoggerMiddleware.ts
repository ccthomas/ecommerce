import middy from '@middy/core';
import { ChildLoggerOptions } from 'pino';
import { getLogger, resetLogger, setLogger } from '../utils/LoggerUtil';

export const configureLogger = (
  options?: ChildLoggerOptions<never>,
): middy.MiddlewareObj<unknown> => {
  const before: middy.MiddlewareFn<unknown> = async (
    request,
  ): Promise<void> => {
    getLogger().debug({
      context: request.context,
    }, 'Configure Logger with event Context.');

    const { context } = request;

    // create child logger from base logger.
    const child = getLogger().child({
      functionName: context.functionName,
      functionVersion: context.functionVersion,
      awsRequestId: context.awsRequestId,
    }, options);

    // set configured child logger as new logger.
    setLogger(child);

    getLogger().debug('Logger configured.');
  };

  const after: middy.MiddlewareFn<unknown> = async (): Promise<void> => {
    getLogger().debug('Configure logger by resetting logger.');
    resetLogger();
  };

  return {
    before,
    after,
  };
};
