import middy from '@middy/core';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuid } from 'uuid';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { configureLogger } from '../middleware/LoggerMiddleware';
import { getLogger } from '../utils/LoggerUtil';
import { httpError } from '../middleware/ApiMiddleware';
import { getClient } from '../utils/S3Util';

const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  getLogger().info({ event }, 'Ecommerce Get By Id handler hit.');

  const client = await getClient();

  const objectKey = `${uuid()}`;

  // Create a command to put an object into the S3 bucket
  const command = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME || 'ecommerce-product-images-offline-us-east-1',
    Key: objectKey,
  });

  // Generate a pre-signed URL for the command
  const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 }); // 5 minutes
  const domainUrl = signedUrl.replace('ecommerce-localstack', '127.0.0.1');

  return {
    statusCode: 200,
    body: JSON.stringify({
      objectKey,
      signedUrl: domainUrl,
    }),
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
