const sendErrorResponse = require("../../../helper/sendErrorResponse");
const { ContactUs } = require("../../../models");
const { addContactUsSchema } = require("../../validations/contactUs/addContactUs.schema");

module.exports = {
    addNewContactUs: async (req, res) => {
        try {
            const { name, email, message } = req.body;

            const { _, error } = addContactUsSchema.validate(req.body);
            if (error) {
                return sendErrorResponse(res, 400, error.details[0].message);
            }

            const newContactUs = new ContactUs({
                ...req.body,
                isDeleted: false,
                isActive: true,
            });
            await newContactUs.save();

            res.status(200).json({
                message: "new contactUs successfully added",
                _id: newContactUs?._id,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },
};
