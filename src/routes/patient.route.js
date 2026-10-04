import express from "express";

import {
  searchNearbyFacilities,
} from "../controllers/patient.controller.js";
import validationMiddleware from "../validations/validation.Middleware.js";
import nearbyFacilitiesSchema from "../validations/patient.validation.js";

const patientRouter = express.Router();

patientRouter.get(
  "/nearby",
    validationMiddleware(nearbyFacilitiesSchema),

  searchNearbyFacilities
);

export default patientRouter;