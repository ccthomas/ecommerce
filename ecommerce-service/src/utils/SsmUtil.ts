import {
  GetParametersCommand, GetParametersCommandInput, GetParametersCommandOutput, Parameter, SSMClient,
} from '@aws-sdk/client-ssm';
import { getLogger } from './LoggerUtil';

let client: SSMClient | undefined;

const connectSSM = () => {
  getLogger().debug('Connect to ssm.');
  if (client === undefined) {
    const config = process.env.STAGE !== 'offline' ? {} : {
      endpoint: process.env.SSM_ENDPOINT || 'http://localstack:4566', // LocalStack S3 endpoint
      region: process.env.AWS_REGION || 'us-east-1', // Set the region; LocalStack uses any valid region
      forcePathStyle: true,
      credentials: {
        accessKeyId: 'dummy-access-key-id', // LocalStack default credentials
        secretAccessKey: 'dummy-secret-access-key', // LocalStack default credentials
      },
    };

    getLogger().debug({ config }, 'Construct ssm client.');
    client = new SSMClient(config);
  }

  getLogger().debug('Returning ssm client.');
  return client;
};

export const getParameters = async (names: string[]): Promise<GetParametersCommandOutput> => {
  getLogger().debug('Get parameters from ssm');
  const ssm = connectSSM();

  const input: GetParametersCommandInput = {
    Names: names,
    WithDecryption: true || false,
  };

  const command = new GetParametersCommand(input);

  getLogger().debug('Send get parameters command.');
  const response: GetParametersCommandOutput = await ssm.send(command);

  getLogger().debug({ invalidParametersCount: response.InvalidParameters?.length || 0 }, 'Get parameters completed.');
  return response;
};

export const reduceParameters = (
  parameters: Parameter[],
): Record<string, string> => {
  // Do NOT log parameters, as they may contain sensitive information.
  getLogger().debug('Reduce parameters');
  return parameters.reduce((acc: Record<string, string>, parameter: Parameter) => {
    if (parameter.Name !== undefined && parameter.Value !== undefined) {
      acc[parameter.Name] = parameter.Value;
    }
    return acc;
  }, {});
};
