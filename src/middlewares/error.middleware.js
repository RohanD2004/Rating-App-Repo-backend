import logger from '../config/logger.js';

export default (err, req, res, next) => {
  // Log error
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  // Map known Sequelize error types to a sensible status/message before falling back to 500
  const pgCode = err.original?.code || err.parent?.code || err.code;
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let extra = {};

  if (err.name === 'SequelizeUniqueConstraintError' || pgCode === '23505') {
    statusCode = 409;
    message = 'Duplicate entry';
    extra.field = err.errors?.[0]?.path || err.message.match(/key \(([^)]+)\)/)?.[1];
  } else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    extra.errors = err.errors?.map((item) => ({ field: item.path, message: item.message }));
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Referenced record does not exist';
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const response = {
    success: false,
    status: statusCode,
    message,
    ...extra
  };

  if (!isProduction) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};