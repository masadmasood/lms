/*
  Centralized Error Handler Middleware
  
  This middleware catches all errors thrown in the Book Service and
  returns a consistent error response format.
  
  Benefits of centralized error handling:
  1. Consistent error response format across all endpoints
  2. Single place to add logging, monitoring, or alerting
  3. Prevents leaking stack traces in production
  4. Makes error handling easier to maintain and extend
*/

const errorHandler = (err, req, res, next) => {
  console.error(`[Book Service Error]: ${err.message}`);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
};

export default errorHandler;
