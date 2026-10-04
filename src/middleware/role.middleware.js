import AppError from "../utils/AppError.js";

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("ليس لديك صلاحية للوصول إلى هذا المورد", 403));
    }

    next();
  };
};

export default roleMiddleware;