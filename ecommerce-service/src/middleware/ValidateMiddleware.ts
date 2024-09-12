import * as Joi from 'joi';
import middy from '@middy/core';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getLogger } from '../utils/LoggerUtil';
import { ApiError } from '../models/error/ApiError';

/**
 * Validate Api Event.
 *
 * This function contains heavy code reusue. This decision was made to
 * improve readability for a heavily reusued function.
 *
 * @param bodySchema http event body object schema.
 * @param pathParamsSchema http event path parameters object schema.
 * @param queryParamsSchema http event query parameters object schema.
 * @returns {middy.MiddlewareObj<APIGatewayProxyEvent>} valid http event.
 */
export const validateApiEvent = (
  bodySchema?: Joi.Schema,
  pathParamsSchema?: Joi.Schema,
  queryParamsSchema?: Joi.Schema,
): middy.MiddlewareObj<APIGatewayProxyEvent> => {
  const before: middy.MiddlewareFn<APIGatewayProxyEvent, APIGatewayProxyResult> = async (
    request,
  ): Promise<void> => {
    getLogger().debug({ event: request.event }, 'Validate Event.');

    const handleValidationError = (error: Joi.ValidationError) => {
      getLogger().warn({ error }, 'Validation result error occured.');
      throw new ApiError({
        statusCode: 400,
        errorCode: 'INVALID_BODY',
        message: error.details.map((value: Joi.ValidationErrorItem) => value.message).join(','),
      });
    };

    if (bodySchema !== undefined) {
      getLogger().debug('Validating body.');
      let parsedBody: object;
      try {
        parsedBody = JSON.parse(request.event.body);
      } catch (e: unknown) {
        getLogger().warn({ error: e }, 'Failed to parse event body.');
        throw new ApiError({
          statusCode: 400,
          errorCode: 'INVALID_BODY',
          message: 'Body is invalid json.',
        });
      }

      await bodySchema.validateAsync(parsedBody).catch(handleValidationError);
    }

    if (pathParamsSchema !== undefined) {
      getLogger().debug('Validating path params.');
      await pathParamsSchema
        .validateAsync(request.event.pathParameters)
        .catch(handleValidationError);
    }

    if (queryParamsSchema !== undefined) {
      getLogger().debug('Validating query params.');
      await queryParamsSchema
        .validateAsync(request.event.queryStringParameters)
        .catch(handleValidationError);
    }

    getLogger().debug('Event is valid.');
  };

  return {
    before,
  };
};
