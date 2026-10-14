
import Joi from "joi";

const updateProfileSchema = Joi.object({
  user: Joi.object({
    name: Joi.string()
      .trim()
      .min(2)
      .max(100),

    email: Joi.string()
      .trim()
      .email(),
  })
    .min(1)
    .optional(),

  facility: Joi.object({
    name: Joi.string()
      .trim()
      .min(2)
      .max(150),

    phone: Joi.string()
      .trim()
      .min(7)
      .max(20),

    address: Joi.string()
      .trim()
      .min(2)
      .max(300),
  })
    .min(1)
    .optional(),
})
  .min(1)
  .required();

export default updateProfileSchema;
