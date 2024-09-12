import { Client } from 'pg';
import { getLogger } from './LoggerUtil';
import { getParameters, reduceParameters } from './SsmUtil';

let client: Client;

/**
 * If using RDS, usee RDS Signer instead of storing password in SSM.
 */
export const connectPsqlClient = async (): Promise<Client> => {
  getLogger().debug('Connect PSQL Client.');
  if (client === undefined) {
    const hostKey = process.env.DB_HOST_SSM_KEY;
    const portKey = process.env.DB_PORT_SSM_KEY;
    const userKey = process.env.DB_USER_SSM_KEY;
    const passwordKey = process.env.DB_PASSWORD_SSM_KEY;
    const databaseKey = process.env.DB_DATABASE_SSM_KEY;

    getLogger().info('Get Parameters');
    const params = await getParameters([
      hostKey,
      portKey,
      userKey,
      passwordKey,
      databaseKey,
    ]);

    // Manual add params to logger for testing.
    // They are not included by default as password is included.
    getLogger().debug({ params }, 'Got Parameters!!!');
    const paramsMap = reduceParameters(params.Parameters);

    const host = paramsMap[hostKey];
    const port = paramsMap[portKey];
    const user = paramsMap[userKey];
    const password = paramsMap[passwordKey];
    const database = paramsMap[databaseKey];

    getLogger().debug('construct client.');
    client = new Client({
      user,
      host,
      database,
      password,
      port: Number(port),
    });

    getLogger().debug('connect client.');
    client.connect();
  }

  getLogger().debug('Return pool with connection.');
  return client;
};
