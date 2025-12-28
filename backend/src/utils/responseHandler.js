const success = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    serverTime: new Date().toISOString()
  });
};

const error = (res, message, statusCode = 500, errorCode = 'SERVER_ERROR', details = null) => {
  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      details,
    },
  });
};

module.exports = {
  success,
  error,
};
