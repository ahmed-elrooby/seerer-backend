import Joi from "joi";

const nearbyFacilitiesSchema = Joi.object({
  type: Joi.string()
    .valid("NICU", "ICU")
    .required(),

  lat: Joi.number()
    .min(-90)
    .max(90)
    .required(),

  lng: Joi.number()
    .min(-180)
    .max(180)
    .required(),
});

export default nearbyFacilitiesSchema;