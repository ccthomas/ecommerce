import middy from '@middy/core';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { httpError } from '../middleware/ApiMiddleware';
import { ApiError } from '../models/ApiError';
import { getLogger } from '../utils/LoggerUtil';
import { configureLogger } from '../middleware/LoggerMiddleware';

export const lambdaHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  getLogger().info({ event }, 'Path Not Found handler hit.');
  throw new ApiError({
    statusCode: 404,
    errorCode: 'PATH_NOT_FOUND',
    message: 'Path provided does not exist',
  });
};

export const handler = middy(lambdaHandler)
  // before
  .use(configureLogger())
  // after
  .use(httpError());
