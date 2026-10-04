import express from "express";
import { forgotPassword, login, logout, resetPassword } from "../controllers/auth.controller.js";
import validationMiddleware from "../validations/validation.Middleware.js";
import forgotPasswordSchema from "../validations/forgotPassword.validation.js";
import resetPasswordSchema from "../validations/resetPassword.validation.js";
import authMiddleware from "../middleware/auth.middleware.js";


const authRouter = express.Router();

authRouter.post("/login", login);
authRouter.post("/logout", authMiddleware, logout);

authRouter.post(
  "/forgot-password",
  validationMiddleware(forgotPasswordSchema),
  forgotPassword
);
authRouter.post(
  "/reset-password",
  validationMiddleware(resetPasswordSchema),
  resetPassword
);
export default authRouter;