import Joi from "joi";

const updateProfileSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100),

  email: Joi.string()
    .trim()
    .email(),
})
  .min(1)
  .required();

export default updateProfileSchema;