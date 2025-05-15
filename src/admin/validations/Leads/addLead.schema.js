const Joi = require("joi");

const addLeadSchema = Joi.object({
    date: Joi.string().required().description("The date of the lead"),
    name: Joi.string().required().description("Name of the lead"),
    company: Joi.string().required().description("Company of the lead"),
    phone: Joi.string().required().description("Phone number of the lead"),
    email: Joi.string()
        .email()
        .required()
        .description("Email address of the lead"),
    city: Joi.string().allow("", null),
    calledBy: Joi.string().allow("", null),
    userStatus: Joi.string()
        .valid(
            "not-contacted-yet",
            "contacted",
            "in-progress",
            "converted",
            "lost"
        )
        .required()
        .description("Current status of the lead"),
    assigned: Joi.string().required(),
    description: Joi.string().required(),
});

module.exports = { addLeadSchema };
