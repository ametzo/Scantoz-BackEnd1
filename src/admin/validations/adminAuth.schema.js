const Joi = require("joi");

const passwordRegx =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
const passswordError = new Error(
    "Password must be strong. At least one alphabet. At least one digit. At least one special character. Minimum eight in length"
);

const adminAddSchema = Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    role: Joi.string(),
    password: Joi.string().allow("", null),
    userId: Joi.string().required(),
    adminRole: Joi.string().valid("admin", "super-admin").required(),
});

const adminLoginSchema = Joi.object({
    userId: Joi.string().required(),
    password: Joi.string().required(),
});

const adminPasswordUpdateSchema = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string()
        .regex(passwordRegx)
        .error(passswordError)
        .required(),
    confirmPassword: Joi.string()
        .valid(Joi.ref("newPassword"))
        .error(new Error("Confirm password must be equal to new password"))
        .required(),
});

module.exports = {
    adminAddSchema,
    adminLoginSchema,
    adminPasswordUpdateSchema,
};
