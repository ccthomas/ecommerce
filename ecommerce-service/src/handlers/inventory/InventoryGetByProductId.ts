import middy from '@middy/core';
import { Client, QueryResult } from 'pg';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import Joi from 'joi';
import { IInventory } from '../../models/IInventory'; // Import the Inventory interface
import { configureLogger } from '../../middleware/LoggerMiddleware';
import { getLogger } from '../../utils/LoggerUtil';
import { connectPsqlClient } from '../../utils/PostgresUtil';
import { httpError } from '../../middleware/ApiMiddleware';
import { validateApiEvent } from '../../middleware/ValidateMiddleware';
import { ApiError } from '../../models/error/ApiError';

const pathParamSchema = Joi.object({
  productId: Joi.string().uuid().required(),
});

const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  getLogger().info({ event }, 'Get Inventory by Product ID handler hit.');

  const client: Client = await connectPsqlClient();

  const { productId } = event.pathParameters;

  getLogger().debug({
    productId,
  }, 'Query for inventory by product id.');

  const result: QueryResult<IInventory> = await client.query(`
    SELECT
      id,
      product_id AS "productId",
      price,
      quantity,
      created_at AS "createdAt",
      updated_at AS "updatedAt",
      deleted_at AS "deletedAt"
    FROM product.inventory
    WHERE deleted_at IS NULL
    AND product_id = $1;
  `, [
    productId,
  ]);

  getLogger().debug({
    rowCount: result.rowCount,
  }, 'Inventory items found.');

  if (result.rowCount === 0) {
    // Should this be and error? Potentially not. For sake of time,
    // leaving implementation similar to product.
    throw new ApiError({
      statusCode: 404,
      errorCode: 'INVENTORY_NOT_FOUND',
      message: 'No inventory found for the given product id',
    });
  }

  const inventoryItems = result.rows;

  return {
    statusCode: 200,
    body: JSON.stringify({
      totalCount: inventoryItems.length,
      data: inventoryItems,
    }),
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
