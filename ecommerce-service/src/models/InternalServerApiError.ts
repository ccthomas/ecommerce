import { ApiError } from './ApiError';

export class InternalServerApiError extends ApiError {
  constructor() {
    super({
      statusCode: 500,
      errorCode: 'INTERNAL_SERVER_ERROR',
      message: 'Server encountered an unexpected condition that prevented it from fulfilling the request.',
    });
  }
}
