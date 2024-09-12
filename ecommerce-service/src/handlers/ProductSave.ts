import middy from '@middy/core';
import { v4 as uuid } from 'uuid';
import { Client, DatabaseError, QueryResult } from 'pg';
import Joi from 'joi';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getLogger } from '../utils/LoggerUtil';
import { IProduct } from '../models/IProduct';
import { configureLogger } from '../middleware/LoggerMiddleware';
import { connectPsqlClient } from '../utils/PostgresUtil';
import { validateApiEvent } from '../middleware/ValidateMiddleware';
import { httpError } from '../middleware/ApiMiddleware';
import { ApiError } from '../models/ApiError';

type IProductDTO = IProduct & {
  createdAt?: Date | string;
  updatedAt?: Date | string;
  deletedAt?: Date | string | null;
};

const productSchema = Joi.object({
  id: Joi.string().uuid().optional(),
  name: Joi.string().min(1).required(),
  imageObjectKey: Joi.string().allow(null).optional(),
  createdAt: Joi.alternatives().try(Joi.date().iso(), Joi.string().isoDate()).when('id', {
    is: Joi.exist(), // If 'id' exists
    then: Joi.required(), // 'createdAt' must be required
    otherwise: Joi.optional(), // If 'id' does not exist, 'createdAt' is optional
  }),
  updatedAt: Joi.alternatives().try(Joi.date().iso(), Joi.string().isoDate()).when('id', {
    is: Joi.exist(), // If 'id' exists
    then: Joi.required(), // 'updatedAt' must be required
    otherwise: Joi.optional(), // If 'id' does not exist, 'updatedAt' is optional
  }),
  deletedAt: Joi.alternatives().try(Joi.date().iso(), Joi.string().isoDate(), Joi.allow(null)).when('id', {
    is: Joi.exist(), // If 'id' exists
    then: Joi.required(), // 'deletedAt' must be required
    otherwise: Joi.optional(), // If 'id' does not exist, 'deletedAt' is optional
  }),
});

const lambdaHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  getLogger().info({ event }, 'Product Save handler hit.');

  const product: IProductDTO = JSON.parse(event.body);

  const currentTimestamp = new Date().toISOString();

  // set audit updated at to verify we are not updating a stale product.
  const auditUpdateAt = product.updatedAt || null;
  product.updatedAt = currentTimestamp;

  if (product.id === undefined) {
    getLogger().trace('Saving new product.');
    product.id = uuid();
    product.createdAt = currentTimestamp;
    product.deletedAt = null;
  }

  const client: Client = await connectPsqlClient();

  getLogger().debug({ product }, 'Save product');
  let result: QueryResult;
  try {
    result = await client.query(`
    INSERT INTO product.product (
      id,
      name,
      image_object_key,
      created_at,
      updated_at,
      deleted_at
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT ON CONSTRAINT product_pkey DO UPDATE
    SET
      name = EXCLUDED.name,
      image_object_key = EXCLUDED.image_object_key,
      created_at = EXCLUDED.created_at,
      updated_at = EXCLUDED.updated_at,
      deleted_at = EXCLUDED.deleted_at
    WHERE
      product.created_at = $4
    AND
      product.updated_at = $7
    RETURNING id;
    `, [
      product.id,
      product.name,
      product.imageObjectKey || null,
      product.createdAt,
      product.updatedAt,
      product.deletedAt,
      auditUpdateAt,
    ]);
  } catch (e) {
    if (e instanceof DatabaseError) {
      if (e.constraint === 'product_name_key') {
        throw new ApiError({
          statusCode: 400,
          errorCode: 'NAME_TAKEN',
          message: 'Product name already taken',
        });
      }
      throw e;
    }
  }

  if (result.rowCount === 0) {
    throw new ApiError({
      statusCode: 400,
      errorCode: 'OUTDATED_PRODUCT', // TODO Turn into constant or enum.
      message: 'Error: You are trying to update an older version of this product. Refetch the latest version of this product and try again.', // TODO Add I18N Support.
    });
  }

  getLogger().info('Successfully saved product.');
  return {
    statusCode: 200,
    body: JSON.stringify(product),
  } as APIGatewayProxyResult;
};

export const handler = middy(lambdaHandler)
  // before
  .use(configureLogger())
  .use(validateApiEvent(productSchema))
  // after
  .use(httpError());
