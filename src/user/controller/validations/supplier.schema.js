const Joi = require("joi");

const supplierSchema = Joi.object({
    siteSupervisorName: Joi.string().required(),
    siteSupervisorMobileNumber: Joi.number().required(),
    siteSupervisorEmail: Joi.string().email().required(),
    accountsName: Joi.string().required(),
    accountsMobileNumber: Joi.number().required(),
    accountsEmail: Joi.string().email().required(),
    accountsName2: Joi.string().allow("", null),
    accountsMobileNumber2: Joi.number().allow("", null),
    accountsEmail2: Joi.string().email().allow("", null),
});

module.exports = supplierSchema;
