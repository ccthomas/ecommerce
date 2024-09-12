import middy from '@middy/core';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { configureLogger } from '../middleware/LoggerMiddleware';
import { getLogger } from '../utils/LoggerUtil';
import { httpError } from '../middleware/ApiMiddleware';
import { getPresignedUrl } from '../utils/S3Util';

const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  getLogger().info({ event }, 'Ecommerce Get By Id handler hit.');

  const payload = await getPresignedUrl();

  return {
    statusCode: 200,
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  } as APIGatewayProxyResult;
};

export const handler = middy(lambdaHandler)
  // before
  .use(configureLogger())
  // after
  .use(httpError());
