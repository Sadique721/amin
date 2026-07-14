import { ApiError } from '../api/ApiError';

export class BadRequestException extends ApiError {
  constructor(message = 'Bad Request') {
    super(400, message);
  }
}

export class UnauthorizedException extends ApiError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

export class ForbiddenException extends ApiError {
  constructor(message = 'Forbidden') {
    super(403, message);
  }
}

export class NotFoundException extends ApiError {
  constructor(message = 'Not Found') {
    super(404, message);
  }
}

export class InternalServerException extends ApiError {
  constructor(message = 'Internal Server Error') {
    super(500, message, false);
  }
}
export { ApiError };
