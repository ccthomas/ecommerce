import middy from '@middy/core';
import { Client } from 'pg';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import Joi from 'joi';
import { configureLogger } from '../../middleware/LoggerMiddleware';
import { getLogger } from '../../utils/LoggerUtil';
import { connectPsqlClient } from '../../utils/PostgresUtil';
import { httpError } from '../../middleware/ApiMiddleware';
import { validateApiEvent } from '../../middleware/ValidateMiddleware';

const pathParamSchema = Joi.object({
  productId: Joi.string().uuid().required(),
});

const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  getLogger().info({ event }, 'Ecommerce Delete handler hit.');

  const client: Client = await connectPsqlClient();

  const { productId } = event.pathParameters;

  getLogger().debug({
    productId,
  }, 'Delete product by id.');
  await client.query(`
    UPDATE product.product
    SET
        -- Free up name to avoid conflicts on unique constraints.
        name = CONCAT(name, '_', TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDDHH24MISS')),
        updated_at = CURRENT_TIMESTAMP,
        deleted_at = CURRENT_TIMESTAMP
    WHERE id = $1;
  `, [
    productId,
  ]);

  getLogger().debug('Done deleting Products.');

  return { statusCode: 201 } as APIGatewayProxyResult;
};

export const handler = middy(lambdaHandler)
  // before
  .use(configureLogger())
  .use(validateApiEvent(undefined, pathParamSchema))
  // after
  .use(httpError());
