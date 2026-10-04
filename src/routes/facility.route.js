import express from "express";
import { createFacility, deleteFacility, getFacilities, getFacilityById, updateFacility, updateFacilityStatus } from "../controllers/facility.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import validationMiddleware from "../validations/validation.Middleware.js";
import {
  facilitySchema,
  updateFacilitySchema,
  updateFacilityStatusSchema,
} from "../validations/facility.Validation.js";


const facilityRouter = express.Router();


// ===============================
// Facilities
// ===============================

facilityRouter
  .route("/")
  .post(
    authMiddleware,
    roleMiddleware("platform_admin"),
    validationMiddleware(facilitySchema),
    createFacility
  )
  .get(
    authMiddleware,
    roleMiddleware("platform_admin"),
    getFacilities
  );


// ===============================
// Facility by ID
// ===============================

facilityRouter
  .route("/:id")
  .get(
    authMiddleware,
    roleMiddleware("platform_admin"),
    getFacilityById
  )
  .put(
    authMiddleware,
    roleMiddleware("platform_admin"),
    validationMiddleware(updateFacilitySchema),
    updateFacility
  )
  .delete(
    authMiddleware,
    roleMiddleware("platform_admin"),
    deleteFacility
  );


// ===============================
// Facility Status
// ===============================

facilityRouter.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("platform_admin"),
  validationMiddleware(updateFacilityStatusSchema),
  updateFacilityStatus
);

export default facilityRouter;