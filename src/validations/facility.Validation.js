
import Joi from "joi";

const facilitySchema = Joi.object({
  // =========================
  // Facility Data
  // =========================

  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required(),

  phone: Joi.string()
    .trim()
    .required(),

  country: Joi.string()
    .trim()
    .required(),

  address: Joi.string()
    .trim()
    .required(),

  city: Joi.string()
    .trim()
    .required(),

  governorate: Joi.string()
    .trim()
    .allow("")
    .default(""),

  location: Joi.object({
    type: Joi.string()
      .valid("Point")
      .required(),

    coordinates: Joi.array()
      .items(Joi.number())
      .length(2)
      .required(),
  }).required(),

  services: Joi.array()
    .items(
      Joi.string().valid("NICU", "ICU")
    )
    .min(1)
    .required(),

  // =========================
  // Hospital Admin Data
  // =========================

  adminName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required(),

  adminEmail: Joi.string()
    .trim()
    .email()
    .lowercase()
    .required(),

  adminPassword: Joi.string()
    .min(6)
    .max(100)
    .required(),
});

const updateFacilitySchema = Joi.object({
  // =========================
  // Facility Data
  // =========================

  name: Joi.string()
    .trim()
    .min(2)
    .max(100),

  phone: Joi.string()
    .trim(),

  country: Joi.string()
    .trim(),

  address: Joi.string()
    .trim(),

  city: Joi.string()
    .trim(),

  governorate: Joi.string()
    .trim()
    .allow(""),

  location: Joi.object({
    type: Joi.string()
      .valid("Point"),

    coordinates: Joi.array()
      .items(Joi.number())
      .length(2),
  }),

  services: Joi.array()
    .items(
      Joi.string().valid("NICU", "ICU")
    )
    .min(1),

  // =========================
  // Hospital Admin Data
  // =========================

  adminName: Joi.string()
    .trim()
    .min(2)
    .max(100),

  adminEmail: Joi.string()
    .trim()
    .email()
    .lowercase(),

  adminPassword: Joi.string()
    .min(6)
    .max(100),
}).min(1);

const updateFacilityStatusSchema = Joi.object({
  isActive: Joi.boolean()
    .required(),
});

export {
  facilitySchema,
  updateFacilitySchema,
  updateFacilityStatusSchema,
};

