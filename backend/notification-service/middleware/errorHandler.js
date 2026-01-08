/*
  Centralized Error Handler Middleware
  
  This middleware catches all errors thrown in the Notification Service
  and returns a consistent error response format.
*/

const errorHandler = (err, req, res, next) => {
  console.error(`[Notification Service Error]: ${err.message}`);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
};

export default errorHandler;
