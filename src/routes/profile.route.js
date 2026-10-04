import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { getProfile, updateProfile } from "../controllers/profile.controller.js";
import validationMiddleware from "../validations/validation.Middleware.js";
import updateProfileSchema from "../validations/profile.validation.js";





const profileRouter = express.Router();

profileRouter
  .route("/")
  .get(
    authMiddleware,
    getProfile
  )
  .put(
    authMiddleware,
    validationMiddleware(updateProfileSchema),
    updateProfile
  );

export default profileRouter;