const Joi = require("joi");

const addServiceSchema = Joi.object({
    customerId: Joi.string()
        .required()
        .description("ID of the customer the service is associated with"),
    project: Joi.string()
        .required()
        .description("The project associated with the service"),
    // serviceCount: Joi.number()
    //     .integer()
    //     .min(1)
    //     .required()
    //     .description(
    //         "Number of services provided (should be a positive integer)"
    //     ),
    startDate: Joi.date()
        .iso() // Ensures the date is in ISO format (YYYY-MM-DD or ISO string)
        .required()
        .description("Start date of the service"),
    endDate: Joi.date().iso().required().description("End date of the service"),
    description: Joi.string()
        .required()
        .description("Description of the service provided"),
});

module.exports = { addServiceSchema };
