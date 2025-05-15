const { isValidObjectId } = require("mongoose");
const {
    sendPushNotificationByEmail,
} = require("../../../helper/pushNotification");
const sendErrorResponse = require("../../../helper/sendErrorResponse");
const { Support, Admin } = require("../../../models");

module.exports = {
    addnewSupports: async (req, res) => {
        try {
            const { subject, message } = req.body;

            const admin = await Admin.findOne({
                _id: req.user?.customerId?.assigned,
            });

            if (!subject) {
                return sendErrorResponse(res, 404, "subject not found");
            }

            let image;

            if (req.file && req.file.path) {
                image = "/" + req.file.path.replace(/\\/g, "/");
            }

            let date = new Date();
            const newSupport = new Support({
                userId: req?.user?.customerId?.id,
                subject,
                messages: [{ message, image, date, sender: "user" }],
                adminId: admin?._id,
                status: "created",
                isDeleted: false,
            });

            await newSupport.save();

            const formattedServiceDate = new Date().toLocaleDateString("en-US");

            const admins = await Admin.find({ status: "active" }).select(
                "adminRole"
            );

            sendPushNotificationByEmail({
                playerIds: [
                    ...admins
                        .filter(
                            (admin) =>
                                admin.adminRole === "super-admin" &&
                                admin._id?.toString() !==
                                    req.admin?._id?.toString()
                        )
                        .map((admin) => admin._id.toString()),
                    // req?.user?._id?.toString(),
                    admin?._id?.toString(),
                ],
                title: `New Support ${newSupport.subject} Created`,
                message: `New support was created on ${formattedServiceDate}.`,
                data: {
                    messageId: newSupport?._id,
                    subject: subject,
                    message: message,
                    date: date,
                },
            });

            res.status(200).json({
                message: "new  support successfully added",
                _id: newSupport?._id,
                subject,
                data: {
                    message,
                    image,
                    date,
                    sender: "user",
                },
            });
        } catch (err) {
            console.log(err);
            sendErrorResponse(res, 500, err);
        }
    },

    getAllSupports: async (req, res) => {
        try {
            const { skip = 0, limit = 10, searchQuery } = req.query;

            const filters = {
                isDeleted: false,
                userId: req?.user?.customerId?.id,
            };

            if (searchQuery && searchQuery !== "") {
                // filters.$or = [
                //     { SupportsName: { $regex: searchQuery, $options: "i" } },
                //     { iataCode: { $regex: searchQuery, $options: "i" } },
                // ];
            }

            const supports = await Support.find(filters)
                .populate("userId", "company")
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(limit * skip)
                .lean();

            const totalSupports = await Support.countDocuments(filters);

            res.status(200).json({
                supports,
                totalSupports,
                skip: Number(skip),
                limit: Number(limit),
            });
        } catch (err) {
            console.log(err);
            sendErrorResponse(res, 500, err);
        }
    },

    getSingleSupports: async (req, res) => {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "invalid Supportsid");
            }

            const support = await Support.findOne({
                isDeleted: false,
                _id: id,
            });

            if (!support) {
                return sendErrorResponse(res, 404, "Supports not found");
            }

            res.status(200).json(support);
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },
};
