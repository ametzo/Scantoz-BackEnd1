const Joi = require("joi");

const passwordRegx =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()-_+=\[\]{}|:;<>,./?~])[A-Za-z\d!@#$%^&*()-_+=\[\]{}|:;<>,./?~]{8,}$/;
const passswordError = new Error(
    "Password must be strong. At least one alphabet. At least one digit. At least one special character. Minimum eight in length"
);

const userLoginSchema = Joi.object({
    userName: Joi.string().required(),
    password: Joi.string().required(),
});

module.exports = { userLoginSchema };
