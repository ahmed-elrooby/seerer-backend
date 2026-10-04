import Joi from "joi";

const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required(),

  newPassword: Joi.string()
    .min(6)
    .required(),

  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "تأكيد كلمة المرور غير مطابق",
    }),
});

export default resetPasswordSchema;