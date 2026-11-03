const AppError = require("../errors/AppError");

function validate(schema, property = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[property]);
    if (!result.success) {
      return next(new AppError(400, "VALIDATION_ERROR",
        "Os dados do pedido não respeitam o formato esperado.",
        result.error.issues.map(i => ({ path: i.path.join("."), message: i.message }))));
    }
    req[property] = result.data;
    next();
  };
}
module.exports = validate;
