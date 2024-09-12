import { S3Client } from '@aws-sdk/client-s3';

let client: S3Client;

export const getClient = async (): Promise<S3Client> => {
  if (client === undefined) {
    client = new S3Client({
      endpoint: 'http://ecommerce-localstack:4566', // LocalStack S3 endpoint
      region: 'us-east-1', // Set the region; LocalStack uses any valid region
      forcePathStyle: true,
      credentials: {
        accessKeyId: 'test', // LocalStack default credentials
        secretAccessKey: 'test', // LocalStack default credentials
      },
    });
  }

  return client;
};

export const getObjectUrl = (objectKey?: string | null): string | null => ((objectKey !== undefined && objectKey !== null) ? `http://127.0.0.1:4566/ecommerce-product-images-offline-us-east-1/${objectKey}` : null);
