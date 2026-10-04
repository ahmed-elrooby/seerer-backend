import Joi from "joi";

const createUnitSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required(),

  type: Joi.string()
    .valid("NICU", "ICU")
    .required(),

  availableBeds: Joi.number()
    .integer()
    .min(0)
    .required(),

  isActive: Joi.boolean().optional(),
});

const updateUnitSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100),

  type: Joi.string()
    .valid("NICU", "ICU"),

  availableBeds: Joi.number()
    .integer()
    .min(0),

  isActive: Joi.boolean(),
});

export {
  createUnitSchema,
  updateUnitSchema,
};