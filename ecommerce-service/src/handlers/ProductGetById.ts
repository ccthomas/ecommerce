import middy from '@middy/core';
import { Client, QueryResult } from 'pg';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import Joi from 'joi';
import { IProduct } from '../models/IProduct';
import { configureLogger } from '../middleware/LoggerMiddleware';
import { getLogger } from '../utils/LoggerUtil';
import { connectPsqlClient } from '../utils/PostgresUtil';
import { httpError } from '../middleware/ApiMiddleware';
import { validateApiEvent } from '../middleware/ValidateMiddleware';
import { ApiError } from '../models/ApiError';

const pathParamSchema = Joi.object({
  productId: Joi.string().uuid().required(),
});

const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  getLogger().info({ event }, 'Ecommerce Get By Id handler hit.');

  const client: Client = await connectPsqlClient();

  const { productId } = event.pathParameters;

  getLogger().debug({
    productId,
  }, 'Query for product by id.');
  const result: QueryResult<IProduct[]> = await client.query(`
    SELECT
      id,
      name,
      created_at AS "createdAt",
      updated_at AS "updatedAt",
      deleted_at AS "deletedAt"
    FROM product.product
    WHERE deleted_at IS NULL
    AND id = $1;
  `, [
    productId,
  ]);

  getLogger().debug({
    rowCount: result.rowCount,
  }, 'Products found.');

  if (result.rowCount !== 1) {
    throw new ApiError({
      statusCode: 404,
      errorCode: 'PRODUCT_NOT_FOUND',
      message: 'Product not found for given id',
    });
  }

  return {
    statusCode: 200,
    body: JSON.stringify(result.rows[0]),
    headers: {
      'Content-Type': 'application/json',
    },
  } as APIGatewayProxyResult;
};

export const handler = middy(lambdaHandler)
  // before
  .use(configureLogger())
  .use(validateApiEvent(undefined, pathParamSchema))
  // after
  .use(httpError());
