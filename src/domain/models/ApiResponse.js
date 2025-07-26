export class ApiResponse {
  constructor(data, success = true, message = '', statusCode = 200) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }

  static success(data, message = 'Request successful') {
    return new ApiResponse(data, true, message, 200);
  }

  static error(message, statusCode = 500, data = null) {
    return new ApiResponse(data, false, message, statusCode);
  }

  static fromResponse(response) {
    return new ApiResponse(
      response.data,
      response.status >= 200 && response.status < 300,
      response.statusText || 'Request completed',
      response.status
    );
  }

  isSuccess() {
    return this.success;
  }

  hasData() {
    return this.data !== null && this.data !== undefined;
  }

  getData() {
    return this.data;
  }

  getMessage() {
    return this.message;
  }

  getStatusCode() {
    return this.statusCode;
  }
}
