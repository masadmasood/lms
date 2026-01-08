/*
  Centralized Error Handler Middleware
  
  This middleware catches all errors thrown in the Borrow Service and
  returns a consistent error response format.
  
  The Borrow Service has more complex error scenarios due to:
  - Cross-service communication failures
  - Business rule violations
  - Validation errors
  
  This handler ensures all errors are formatted consistently.
*/

const errorHandler = (err, req, res, next) => {
  console.error(`[Borrow Service Error]: ${err.message}`);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
};

export default errorHandler;
