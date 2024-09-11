import request from 'supertest';
import { expect, describe, it } from '@jest/globals';

const API: string = process.env.SERVICE_API || 'http://127.0.0.1:3005/offline';

describe('Integration Test', () => {
  it('should return a 404 status code and a message', async () => {
    // exercise

    const response = await request(API)
      .get('/not/real/path')
      .send();

    // verify

    expect(response.status).toEqual(404);
    expect(response.body.errorMessage).toEqual('Path provided does not exist');
    expect(response.body.timestamp).toBeTruthy();
  });
});
