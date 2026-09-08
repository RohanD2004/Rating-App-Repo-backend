export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: err.errors,
      errorCode: "VALIDATION_ERROR"
    });
  }
};