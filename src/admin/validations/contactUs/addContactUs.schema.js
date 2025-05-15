const Joi = require("joi");

const addContactUsSchema = Joi.object({
    name: Joi.string().required().description("Name of the lead"),
    email: Joi.string()
        .email()
        .required()
        .description("Email address of the lead"),
    message: Joi.string().required(),
});

module.exports = { addContactUsSchema };
