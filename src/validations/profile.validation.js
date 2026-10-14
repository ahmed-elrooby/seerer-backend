
import Joi from "joi";

const updateProfileSchema = Joi.object({
  user: Joi.object({
    name: Joi.string().trim().min(2).max(100),
    email: Joi.string().trim().email(),
  }).min(1),

  facility: Joi.object({
    name: Joi.string().trim().min(2).max(150),
    phone: Joi.string().trim().min(7).max(20),
    address: Joi.string().trim().min(2).max(300),

    location: Joi.object({
      type: Joi.string().valid("Point").required(),

      coordinates: Joi.array()
        .ordered(
          Joi.number().min(-180).max(180).required(),
          Joi.number().min(-90).max(90).required()
        )
        .length(2)
        .required(),
    }),
  }).min(1),
})
  .min(1)
  .required();

export default updateProfileSchema;
