import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getLogger } from './LoggerUtil';

let client: S3Client;

/**
 * Technical Debt: Naming Convention.
 *
 * The function name "getClient" is an old naming conveention I use to follow.
 * I have since changed to "connectX". This old function needs to be updated to the new pattern.
 */
export const getClient = async (): Promise<S3Client> => {
  getLogger().debug('Getting S3 Client');
  if (client === undefined) {
    const config = process.env.STAGE !== 'offline' ? {} : {
      endpoint: process.env.S3_ENDPOINT || 'http://localstack:4566', // LocalStack S3 endpoint
      region: process.env.AWS_REGION || 'us-east-1', // Set the region; LocalStack uses any valid region
      forcePathStyle: true,
      credentials: {
        accessKeyId: 'test', // LocalStack default credentials
        secretAccessKey: 'test', // LocalStack default credentials
      },
    };

    getLogger().debug({ config }, 'Constructing new S3 Clieent');
    client = new S3Client(config);
  }

  getLogger().debug('Returning S3 Client');
  return client;
};

const getProductImageBucketName = () => (process.env.S3_PRODUCT_IMAGE_BUCKET_NAME || 'ecommerce-product-images-offline-us-east-1');

export const getObjectUrl = (objectKey?: string | null): string | null => {
  if (objectKey === undefined || objectKey === null) {
    return null;
  }

  const s3Url = process.env.S3_URL || 'http://127.0.0.1:4566';
  const bucketName = getProductImageBucketName();

  return `${s3Url}/${bucketName}/${objectKey}`;
};

/**
 * Design Flaw...
 *
 * This "Utility" is only useful for product images.
 */
export const getPresignedUrl = async (): Promise<{
  signedUrl: string;
  objectKey: string;
}> => {
  const s3Client = await getClient();

  const objectKey = `${uuid()}`;

  const bucketName = getProductImageBucketName();

  // Create a command to put an object into the S3 bucket
  getLogger().debug({ bucketName, objectKey }, 'Create put object command.');
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
  });

  // Generate a pre-signed URL for the command
  getLogger().debug('Generate a pre-signed URL for the command.');
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 5 minutes

  let publicSignedUrl = signedUrl;
  if (process.env.STAGE === 'offline') {
    const localstackContainerName = process.env.LOCALSTACK_CONTAINER_NAME;
    getLogger().debug('Replacing container url with public local host url.');
    publicSignedUrl = publicSignedUrl.replace(localstackContainerName, '127.0.0.1');
  }

  return {
    signedUrl: publicSignedUrl,
    objectKey,
  };
};
