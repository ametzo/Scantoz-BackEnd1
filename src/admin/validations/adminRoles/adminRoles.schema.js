const Joi = require("joi");

const validOptions = [
    "view",
    "create",
    "update",
    "delete",
    "approve",
    "cancel",
];

const adminRoleSchema = Joi.object({
    roleName: Joi.string().required(),
    description: Joi.string().required(),
    roles: Joi.array().items({
        _id: Joi.allow("", null),
        processName: Joi.string().required(),
        stepNumber: Joi.number().required(),
        permissions: Joi.array().items(Joi.string().valid(...validOptions)),
    }),
});

module.exports = { adminRoleSchema };
