export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(errors?: Record<string, string[]>) {
    super(400, "Validation failed", errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthenticated") {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(403, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(404, message);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(409, message);
  }
}

export class BusinessRuleError extends AppError {
  constructor(message: string) {
    super(422, message);
  }
}
