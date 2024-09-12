import middy from '@middy/core';
import { v4 as uuid } from 'uuid';
import { Client, DatabaseError, QueryResult } from 'pg';
import Joi from 'joi';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getLogger } from '../../utils/LoggerUtil';
import { configureLogger } from '../../middleware/LoggerMiddleware';
import { connectPsqlClient } from '../../utils/PostgresUtil';
import { validateApiEvent } from '../../middleware/ValidateMiddleware';
import { httpError } from '../../middleware/ApiMiddleware';
import { ApiError } from '../../models/error/ApiError';
import { IInventory } from '../../models/IInventory';

// Define the Inventory DTO type
type IInventoryDTO = IInventory & {
  createdAt?: Date | string;
  updatedAt?: Date | string;
  deletedAt?: Date | string | null;
};

// Define the Joi schema for Inventory
const inventorySchema = Joi.object({
  id: Joi.string().uuid().optional(),
  productId: Joi.string().uuid().required(),
  price: Joi.number().precision(2).positive().required(),
  quantity: Joi.number().integer().min(0).required(),
  createdAt: Joi.alternatives().try(Joi.date().iso(), Joi.string().isoDate()).when('id', {
    is: Joi.exist(),
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  updatedAt: Joi.alternatives().try(Joi.date().iso(), Joi.string().isoDate()).when('id', {
    is: Joi.exist(),
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  deletedAt: Joi.alternatives().try(Joi.date().iso(), Joi.string().isoDate(), Joi.allow(null)).when('id', {
    is: Joi.exist(),
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

const lambdaHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  getLogger().info({ event }, 'Inventory Save handler hit.');

  const inventory: IInventoryDTO = JSON.parse(event.body);

  const currentTimestamp = new Date().toISOString();

  // Set audit updated_at to verify we are not updating a stale inventory.
  const auditUpdateAt = inventory.updatedAt || null;
  inventory.updatedAt = currentTimestamp;

  if (inventory.id === undefined) {
    getLogger().trace('Saving new inventory item.');
    inventory.id = uuid();
    inventory.createdAt = currentTimestamp;
    inventory.deletedAt = null;
  }

  const client: Client = await connectPsqlClient();

  getLogger().debug({ inventory }, 'Save inventory item');
  let result: QueryResult;
  try {
    result = await client.query(`
    INSERT INTO product.inventory (
      id,
      product_id,
      price,
      quantity,
      created_at,
      updated_at,
      deleted_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT ON CONSTRAINT inventory_pkey DO UPDATE
    SET
      product_id = EXCLUDED.product_id,
      price = EXCLUDED.price,
      quantity = EXCLUDED.quantity,
      created_at = EXCLUDED.created_at,
      updated_at = EXCLUDED.updated_at,
      deleted_at = EXCLUDED.deleted_at
    WHERE
      product.inventory.created_at = $5
    AND
      product.inventory.updated_at = $8
    RETURNING id;
    `, [
      inventory.id,
      inventory.productId,
      inventory.price,
      inventory.quantity,
      inventory.createdAt,
      inventory.updatedAt,
      inventory.deletedAt,
      auditUpdateAt,
    ]);

    if (result.rowCount === 0) {
      throw new ApiError({
        statusCode: 400,
        errorCode: 'OUTDATED_INVENTORY',
        message: 'Error: You are trying to update an older version of this inventory item. Refetch the latest version of this item and try again.',
      });
    }

    // Fetch the lowest price for the product
    const lowestPriceResult: QueryResult = await client.query(`
      SELECT MIN(price) AS lowest_price
      FROM product.inventory
      WHERE product_id = $1
      AND deleted_at IS NULL;
    `, [inventory.productId]);

    const lowestPrice = lowestPriceResult.rows[0].lowest_price || null;

    // Update the product table with the lowest price
    await client.query(`
      UPDATE product.product
      SET price_lowest = $1
      WHERE id = $2;
    `, [lowestPrice, inventory.productId]);
  } catch (e) {
    if (e instanceof DatabaseError) {
      if (e.constraint === 'inventory_product_id_key') {
        throw new ApiError({
          statusCode: 400,
          errorCode: 'PRODUCT_NOT_FOUND',
          message: 'Product ID not found or is invalid',
        });
      }
      throw e;
    }
  }

  getLogger().info('Successfully saved inventory item.');
  return {
    statusCode: 200,
    body: JSON.stringify(inventory),
  } as APIGatewayProxyResult;
};

export const handler = middy(lambdaHandler)
  .use(configureLogger())
  .use(validateApiEvent(inventorySchema))
  .use(httpError());
