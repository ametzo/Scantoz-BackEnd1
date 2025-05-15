const Joi = require("joi");

const addWorkerSchema = Joi.object({
    employeeName: Joi.string().required().description("Name of the employee"),
    address: Joi.string().allow("", null),
    phone: Joi.string().allow("", null),
});

module.exports = { addWorkerSchema };
