export class ApiError extends Error {
  // Class properties
  statusCode: number;

  errorCode: string;

  errorMessage: string;

  timestamp: string;

  // Constructor
  constructor({ statusCode, errorCode, message }) {
    super(message); // Pass message to the base Error class

    // Set custom properties
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.errorMessage = message;
    this.timestamp = new Date().toISOString(); // ISO 8601 format timestamp

    // Set the prototype explicitly to ensure instanceof checks work correctly
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
