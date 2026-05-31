/* eslint-disable no-unused-vars */
import z from 'zod';

const globalErrorHandler = (err, req, res, next) => {
  if (err instanceof z.ZodError) {
    const validationIssues = err.issues || err.errors || [];
    return res.status(400).json({
      status: 'fail',
      errors: validationIssues.map((e) => ({
        field: e.path[0] || 'payload',
        message: e.message,
      })),
    });
  }

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  if (statusCode === 500) {
    console.error('Terjadi Kesalahan Server:', err);
  }

  return res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal server error',
  });
};

export { globalErrorHandler };
