import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { createUnitSchema, updateUnitSchema } from "../validations/unit.validation.js";
import { createUnit, deleteUnit, getUnitById, getUnits, updateUnit } from "../controllers/unit.controller.js";
import validationMiddleware from "../validations/validation.Middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";

const unitRouter = express.Router();
unitRouter.route("/").post(authMiddleware, roleMiddleware("hospital_admin"),validationMiddleware(createUnitSchema), createUnit).get(authMiddleware, roleMiddleware("hospital_admin"), getUnits);
unitRouter.route("/:id").get(authMiddleware, roleMiddleware("hospital_admin"), getUnitById).put(authMiddleware, roleMiddleware("hospital_admin"),validationMiddleware(updateUnitSchema), updateUnit).delete(authMiddleware, roleMiddleware("hospital_admin"), deleteUnit);

export default unitRouter;