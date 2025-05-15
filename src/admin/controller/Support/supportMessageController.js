const { isValidObjectId } = require("mongoose");
const { sendPushNotificationByEmail } = require("../../../helper/pushNotification");
const sendErrorResponse = require("../../../helper/sendErrorResponse");
const { Support, CustomerEmployee } = require("../../../models");

module.exports = {
    addNewMessage: async (req, res) => {
        try {
            const { id } = req.params;
            const { message } = req.body;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "invalid id");
            }

            let image;

            if (req.file && req.file.path) {
                image = "/" + req.file.path.replace(/\\/g, "/");
            }

            let date = new Date();
            const support = await Support.findOneAndUpdate(
                { _id: id },
                {
                    $push: {
                        messages: { message, image, date, sender: "admin" },
                    },
                },
                { new: true }
            );

            if (!support) {
                return sendErrorResponse(res, 404, "subject not found");
            }

            const users = await CustomerEmployee.find({
                isDeleted: false,
                customerId: support?.userId,
            }).select("name");

          

            sendPushNotificationByEmail({
                playerIds: [...users.map((user) => user._id.toString())],
                title: `New Support Message On ${support?.subject}`,
                message: message,
                data: {
                    messageId: support?._id,
                    message,
                    image,
                    date,
                },
            });

            res.status(200).json({
                message: "new message successfully added",
                data: {
                    message,
                    image,
                    date,
                    sender: "admin",
                },
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getAllMessage: async (req, res) => {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "invalid id");
            }

            const support = await Support.findOne({ _id: id });

            res.status(200).json({
                messages: support.messages || [],
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },
};
