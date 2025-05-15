const Joi = require("joi");

const serviceApprovalSchema = Joi.object({
    signedBy: Joi.string().required(),
    signedTime: Joi.string().required(),
});

module.exports = { serviceApprovalSchema };
