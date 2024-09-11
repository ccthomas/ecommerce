import {
  GetParametersCommand, GetParametersCommandInput, GetParametersCommandOutput, Parameter, SSMClient,
} from '@aws-sdk/client-ssm';
import { getLogger } from './LoggerUtil';

let client: SSMClient | undefined;

const connectSSM = () => {
  getLogger().debug('Connect to ssm.');
  if (client === undefined) {
    getLogger().debug('Construct ssm client.');
    // TODO Make this configurable
    // TODO Only connect offline if stage is offline
    client = new SSMClient({
      region: 'us-east-1', // LocalStack's default region
      endpoint: 'http://ecommerce-localstack:4566', // LocalStack's SSM endpoint
      credentials: {
        accessKeyId: 'dummy-access-key-id', // Dummy credentials
        secretAccessKey: 'dummy-secret-access-key',
      },
    });
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
  getLogger().debug('Reduce parameters');
  return parameters.reduce((acc: Record<string, string>, parameter: Parameter) => {
    if (parameter.Name !== undefined && parameter.Value !== undefined) {
      acc[parameter.Name] = parameter.Value;
    }
    return acc;
  }, {});
};
