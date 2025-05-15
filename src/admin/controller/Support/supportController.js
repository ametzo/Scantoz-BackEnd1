const { isValidObjectId } = require("mongoose");
const {
    sendPushNotificationByEmail,
} = require("../../../helper/pushNotification");
const sendErrorResponse = require("../../../helper/sendErrorResponse");
const { Support, Admin, CustomerEmployee } = require("../../../models");

module.exports = {
    addnewSupports: async (req, res) => {
        try {
            const { userId, subject } = req.body;

            if (!isValidObjectId(userId)) {
                return sendErrorResponse(res, 400, "invalid userId");
            }

            if (!subject) {
                return sendErrorResponse(res, 404, "subject not found");
            }
            const newSupport = new Support({
                userId,
                subject,
                adminId: req.admin?._id,
                status: "created",
                isDeleted: false,
            });
            await newSupport.save();

            const admins = await Admin.find({ status: "active" }).select(
                "adminRole"
            );

            const users = await CustomerEmployee.find({
                isDeleted: false,
                customerId: userId,
            }).select("name");

            const formattedServiceDate = new Date().toLocaleDateString("en-US");

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
                    // userId?.toString(),
                    ...users.map((user) => user._id.toString()),
                    // req.admin?._id?.toString(),
                ].filter(Boolean),
                title: "New Support Created",
                message: `New support was completed on ${formattedServiceDate}.`,
                data: {
                    ticketId: newSupport?._id,
                    subject: subject,
                },
            });

            res.status(200).json({
                message: "new  support successfully added",
                _id: newSupport?._id,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    deleteSupports: async (req, res) => {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "invalid Supportsid");
            }

            const support = await Support.findOneAndUpdate(
                {
                    _id: id,
                    isDeleted: false,
                },
                { $set: { isDeleted: true } }
            );
            if (!support) {
                return sendErrorResponse(res, 404, "Supports not found");
            }

            res.status(200).json({
                message: " support successfully deleted",
                _id: id,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getAllSupports: async (req, res) => {
        try {
            const {
                skip = 0,
                limit = 10,
                fromDate,
                toDate,
                searchQuery,
            } = req.query;

            const filters = { isDeleted: false };
            let filter2 = {};

            if (fromDate || toDate) {
                if (fromDate && toDate) {
                    filter2.$and = [
                        { createdAt: { $gte: new Date(fromDate) } },
                        { createdAt: { $lte: new Date(toDate) } },
                    ];
                } else if (fromDate) {
                    filter2["createdAt"] = { $gte: new Date(fromDate) };
                } else if (toDate) {
                    filter2["createdAt"] = { $lte: new Date(toDate) };
                }
            }

            if (searchQuery && searchQuery !== "") {
                filter2 = {
                    $or: [
                        {
                            "userId.company": {
                                $regex: searchQuery,
                                $options: "i",
                            },
                        },
                        { subject: { $regex: searchQuery, $options: "i" } }, // Match on subject field if searchQuery exists
                    ],
                };
            }

            const supports = await Support.aggregate([
                {
                    $match: filters, // Match initial filters on the Support collection
                },
                {
                    $lookup: {
                        from: "customers",
                        localField: "userId",
                        foreignField: "_id",
                        as: "userId",
                        pipeline: [
                            {
                                $project: {
                                    _id: 1,
                                    company: 1,
                                },
                            },
                        ],
                    },
                },
                { $unwind: "$userId" }, // Unwind the userId to access nested fields like company
                {
                    $match: filter2,
                },
                { $sort: { createdAt: -1 } },
                {
                    $project: {
                        userId: 1,
                        subject: 1,
                        status: 1,
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalSupports: { $sum: 1 },
                        data: { $push: "$$ROOT" },
                    },
                },
                {
                    $project: {
                        totalSupports: 1,
                        data: {
                            $slice: [
                                "$data",
                                Number(limit) * Number(skip),
                                Number(limit),
                            ],
                        },
                    },
                },
            ]);

            res.status(200).json({
                supports: supports[0]?.data,
                totalSupports: supports[0]?.totalSupports,
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

    updateSupportStatus: async (req, res) => {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "invalid Supportsid");
            }

            const { status } = req.body;

            if (!status) {
                return sendErrorResponse(res, 400, " Support status required");
            }

            const support = await Support.findOneAndUpdate(
                {
                    _id: id,
                    isDeleted: false,
                },
                { $set: { status } }
            );
            if (!support) {
                return sendErrorResponse(res, 404, "Supports not found");
            }

            res.status(200).json({
                message: " support successfully updated",
                _id: id,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },
};
