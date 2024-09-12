import middy from '@middy/core';
import { getLogger } from '../utils/LoggerUtil';
import { ApiError } from '../models/error/ApiError';
import { IApiErrorMessage } from '../models/error/IApiErrorMessage';
import { InternalServerApiError } from '../models/error/InternalServerApiError';

export const httpError = (): middy.MiddlewareObj<unknown> => ({
  onError: (handler) => {
    const { error } = handler;
    getLogger().error({ error }, 'Api Middleware handling error.');

    const apiError: ApiError = error instanceof ApiError ? error : new InternalServerApiError();

    // eslint-disable-next-line no-param-reassign
    handler.response = {
      statusCode: apiError.statusCode,
      body: JSON.stringify({
        ...apiError,
        statusCode: undefined, // remove status code from payload.
        service: process.env.SERVICE || 'unknown',
        serviceVersion: process.env.SERVICE_VERSION || 'unknown',
      } as IApiErrorMessage),
    };
  },
});
