class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function errorHandler(error, _req, res, _next) {
  if (error instanceof ApiError) {
    return res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
    });
  }

  if (error?.name === "ZodError") {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "The request contains invalid values.",
        details: error.issues.map(({ path, message }) => ({ field: path.join("."), message })),
      },
    });
  }

  if (error?.code === "P2002") {
    return res.status(409).json({
      error: { code: "CONFLICT", message: "A record with that value already exists." },
    });
  }

  if (error?.code === "P2025") {
    return res.status(404).json({
      error: { code: "NOT_FOUND", message: "The requested record was not found." },
    });
  }

  console.error("Unhandled API error:", error);
  return res.status(500).json({
    error: { code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred." },
  });
}

module.exports = { ApiError, errorHandler };
