import { APIGatewayProxyEvent } from 'aws-lambda';
import { expect, describe, it } from '@jest/globals';
import { fail } from 'assert';
import { lambdaHandler } from '../../../handlers/XPathNotFound';
import { ApiError } from '../../../models/ApiError';

describe('Hello World Handler', () => {
  it('should return a 404 status code and a message', async () => {
    // setup

    // @ts-expect-error event is not populated with valid structure.
    const event: APIGatewayProxyEvent = {
      path: '/not/real/path',
    };

    // exercise
    await lambdaHandler(event).then(() => {
      fail('An Error should have been thrown');
    }).catch((e: unknown) => {
      // verify
      expect(e instanceof ApiError).toBeTruthy();
      expect((e as ApiError).statusCode).toEqual(404);
      // TODO Finished assertions...
    });
  });
});
