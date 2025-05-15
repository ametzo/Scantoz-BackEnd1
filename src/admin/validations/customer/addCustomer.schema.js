const Joi = require("joi");

const addCustomerSchema = Joi.object({
    assigned: Joi.string().required().description("Assiged Sub user"),
    company: Joi.string().required().description("Company of the customer"),
    phone: Joi.string().required().description("Phone number of the customer"),
    email: Joi.string()
        .email()
        .required()
        .description("Email address of the customer"),
    city: Joi.string().allow(null, ""),
    // userStatus: Joi.string()
    //     .valid(
    //         "not-contacted-yet",
    //         "contacted",
    //         "in-Progress",
    //         "converted",
    //         "lost"
    //     )
    //     .required()
    //     .description("Current status of the customer"),
});

const addCustomerEmployeeSchema = Joi.object({
    customerId: Joi.string().required().description("Company of the customer"),
    name: Joi.string().required(),
    designation: Joi.string().required(),
    email: Joi.string().required(),
    phone: Joi.string().required(),
    isLoggin: Joi.boolean().required(),
    userName: Joi.string().when("isLoggin", {
        is: true, // Condition: if `isLoggin` is true
        then: Joi.string().required(), // `userName` is required
        otherwise: Joi.string().allow("", null), // `userName` is optional if `isLoggin` is false
    }),
    password: Joi.string().when("isLoggin", {
        is: true, // Condition: if `isLoggin` is true
        then: Joi.string().required(), // `password` is required
        otherwise: Joi.string().allow("", null), // `password` is optional if `isLoggin` is false
    }),
});

const editCustomerEmployeeSchema = Joi.object({
    customerId: Joi.string().required().description("Company of the customer"),
    name: Joi.string().required(),
    designation: Joi.string().required(),
    email: Joi.string().required(),
    phone: Joi.string().required(),
    isLoggin: Joi.boolean().required(),
    userName: Joi.string().when("isLoggin", {
        is: true, // Condition: if `isLoggin` is true
        then: Joi.string().required(), // `userName` is required
        otherwise: Joi.string().allow("", null), // `userName` is optional if `isLoggin` is false
    }),
    password: Joi.string().allow("", null),
});
module.exports = {
    addCustomerSchema,
    addCustomerEmployeeSchema,
    editCustomerEmployeeSchema,
};
