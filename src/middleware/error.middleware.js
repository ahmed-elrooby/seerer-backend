const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  // Invalid MongoDB ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "المعرف غير صالح",
    });
  }

  // MongoDB duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];

    return res.status(400).json({
      success: false,
      message: `${field} مستخدم بالفعل`,
    });
  }

  // Joi / Validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // AppError
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Unknown error
  return res.status(500).json({
    success: false,
    message: "حدث خطأ داخلي في السيرفر",
  });
};

export default errorMiddleware;