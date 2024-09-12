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
import { getObjectUrl } from '../utils/S3Util';

const queryParamsSchema = Joi.object({
  page: Joi.number().min(1).optional(),
  page_size: Joi.number().min(1).optional(),
  name: Joi.string().optional(),
  sort_by: Joi.string().valid('name', 'created_at', 'updated_at').optional(),
  sort: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').optional(),
}).allow(null).optional();

const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  getLogger().info({ event }, 'Ecommerce Get All handler hit.');

  const client: Client = await connectPsqlClient();

  // Extract query parameters
  const page = parseInt(event.queryStringParameters?.page || '1', 10);
  const pageSize = parseInt(event.queryStringParameters?.page_size || '10', 10);
  const nameFilter = event.queryStringParameters?.name || null;
  const sortBy = event.queryStringParameters?.sort_by || 'name';
  const sortOrder = event.queryStringParameters?.sort.toLocaleLowerCase() === 'desc' ? 'DESC' : 'ASC';

  const offset = (page - 1) * pageSize;

  getLogger().debug({
    offset,
    pageSize,
    nameFilter,
    sortBy,
    sortOrder,
  }, 'Query for products');
  const result: QueryResult<IProduct> = await client.query(`
    SELECT
      id,
      name,
      image_object_key AS "imageObjectKey",
      created_at AS "createdAt",
      updated_at AS "updatedAt",
      deleted_at AS "deletedAt"
    FROM product.product
    WHERE deleted_at IS NULL
      AND ($1::text IS NULL OR name ILIKE '%' || $1::text || '%')
    ORDER BY 
        (case WHEN $2 = 'name' AND $3 = 'ASC' THEN name end) ASC,
        (case WHEN $2 = 'name' AND $3 = 'DESC' THEN name end) DESC,
        (case WHEN $2 = 'created_at' AND $3 = 'ASC' THEN created_at end) ASC,
        (case WHEN $2 = 'created_at' AND $3 = 'DESC' THEN created_at end) DESC,
        (case WHEN $2 = 'updated_at' AND $3 = 'ASC' THEN updated_at end) ASC,
        (case WHEN $2 = 'updated_at' AND $3 = 'DESC' THEN updated_at end) DESC
    LIMIT $4 OFFSET $5;
  `, [
    nameFilter,
    sortBy,
    sortOrder,
    pageSize,
    offset,
  ]);

  getLogger().debug({
    rowCount: result.rowCount,
  }, 'Products found.');

  getLogger().debug('Fetch total count for paging.');
  const totalCountResult = await client.query(`
    SELECT COUNT(*) FROM product.product
    WHERE deleted_at IS NULL
    AND ($1::text IS NULL OR name ILIKE $1::text)
  `, [nameFilter]);

  getLogger().debug({ rows: totalCountResult.rows }, 'Total count found.');
  const totalCount = parseInt(totalCountResult.rows[0].count, 10);

  const data = result.rows.map((product: IProduct) => ({
    ...product,
    imageUrl: getObjectUrl(product.imageObjectKey),
  }));

  return {
    statusCode: 200,
    body: JSON.stringify({
      countTotal: totalCount,
      count: result.rowCount,
      page: {
        page,
        pageSize,
        initialPage: 1,
        totalPages: Math.ceil(totalCount / pageSize),
      },
      sort: {
        sortBy,
        sortOrder,
      },
      query: {
        name: nameFilter || undefined,
      },
      data,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  } as APIGatewayProxyResult;
};

export const handler = middy(lambdaHandler)
  // before
  .use(configureLogger())
  .use(validateApiEvent(undefined, undefined, queryParamsSchema))
  // after
  .use(httpError());
