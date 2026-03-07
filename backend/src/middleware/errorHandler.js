// 404 handler for unknown routes
const notFound = (req, res, _next) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

// Global error-handling middleware
// Use: call next(err) in route handlers when something goes wrong
// or let thrown errors bubble up.
const errorHandler = (err, _req, res, _next) => {
  console.error('Unhandled error:', err);

  const status = res.statusCode >= 400 ? res.statusCode : 500;

  res.status(status).json({
    message: err.message || 'Server error',
  });
};

module.exports = { notFound, errorHandler };

