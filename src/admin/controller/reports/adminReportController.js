const { isValidObjectId, Types } = require("mongoose");
const {
    sendPushNotificationByEmail,
} = require("../../../helper/pushNotification");
const sendErrorResponse = require("../../../helper/sendErrorResponse");
const {
    Service,
    GenerateService,
    Worker,
    CustomerEmployee,
} = require("../../../models");
const {
    addServiceSchema,
} = require("../../validations/service/addService.schema");
const {
    serviceValidationSchema,
} = require("../../validations/service/generateService.schema");
const { ObjectId } = require("mongodb");
const { createSericesPdf } = require("../../../helper/customer/customerHelper");

module.exports = {
    getAllServices: async (req, res) => {
        try {
            const {
                skip = 0,
                limit = 10,
                customerId,
                serviceId,
                fromDate,
                toDate,
            } = req.query;

            const filters = { isDeleted: false };
            const filter2 = {};

            if (customerId && customerId !== "") {
                filter2["customerDetail._id"] = new ObjectId(customerId);
            }

            if (serviceId && serviceId !== "") {
                filters["serviceId"] = new ObjectId(serviceId);
            }

            if (fromDate || toDate) {
                if (fromDate && toDate) {
                    filters.$and = [
                        { serviceDate: { $gte: new Date(fromDate) } },
                        { serviceDate: { $lte: new Date(toDate) } },
                    ];
                } else if (fromDate) {
                    filters["serviceDate"] = { $gte: new Date(fromDate) };
                } else if (toDate) {
                    filters["serviceDate"] = { $lte: new Date(toDate) };
                }
            }

            const aggregationPipeline = [
                { $match: filters },
                {
                    $lookup: {
                        from: "services",
                        localField: "serviceId",
                        foreignField: "_id",
                        as: "serviceDetails",
                    },
                },
                {
                    $lookup: {
                        from: "workers",
                        localField: "servicedBy",
                        foreignField: "_id",
                        as: "workerDetails",
                    },
                },
                {
                    $addFields: {
                        serviceDetail: { $arrayElemAt: ["$serviceDetails", 0] },
                    },
                },
                {
                    $lookup: {
                        from: "customers",
                        localField: "serviceDetail.customerId",
                        foreignField: "_id",
                        as: "customerDetails",
                    },
                },
                {
                    $addFields: {
                        customerDetail: {
                            $arrayElemAt: ["$customerDetails", 0],
                        },
                    },
                },
                { $match: filter2 },

                {
                    $project: {
                        customerDetails: 0,
                        serviceDetails: 0,
                    },
                },
                { $sort: { createdAt: -1 } },
                { $skip: Number(skip) * Number(limit) },
                { $limit: Number(limit) },
            ].filter(Boolean);

            const reports = await GenerateService.aggregate(
                aggregationPipeline
            );

            const countPipeline = [
                { $match: filters },
                {
                    $lookup: {
                        from: "services",
                        localField: "serviceId",
                        foreignField: "_id",
                        as: "serviceDetails",
                    },
                },
                {
                    $addFields: {
                        serviceDetail: { $arrayElemAt: ["$serviceDetails", 0] },
                    },
                },
                {
                    $lookup: {
                        from: "customers",
                        localField: "serviceDetail.customerId",
                        foreignField: "_id",
                        as: "customerDetails",
                    },
                },
                {
                    $addFields: {
                        customerDetail: {
                            $arrayElemAt: ["$customerDetails", 0],
                        },
                    },
                },
                { $match: filter2 },
            ].filter(Boolean);

            const totalReports = await GenerateService.aggregate(countPipeline);

            res.status(200).json({
                reports,
                totalReports: totalReports.length,
                skip: Number(skip),
                limit: Number(limit),
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    downloadGeneratedService: async (req, res) => {
        try {
            const {
                skip = 0,
                limit = 10,
                customerId,
                serviceId,
                fromDate,
                toDate,
            } = req.query;

            const filters = { isDeleted: false };
            const filter2 = {};

            if (customerId && customerId !== "") {
                filter2["customerDetail._id"] = new ObjectId(customerId);
            }

            if (serviceId && serviceId !== "") {
                filters.serviceId = new ObjectId(serviceId);
            }

            if (fromDate || toDate) {
                if (fromDate && toDate) {
                    filters.$and = [
                        { serviceDate: { $gte: new Date(fromDate) } },
                        { serviceDate: { $lte: new Date(toDate) } },
                    ];
                } else if (fromDate) {
                    filters["serviceDate"] = { $gte: new Date(fromDate) };
                } else if (toDate) {
                    filters["serviceDate"] = { $lte: new Date(toDate) };
                }
            }

            const aggregationPipeline = [
                { $match: filters },
                {
                    $lookup: {
                        from: "services",
                        localField: "serviceId",
                        foreignField: "_id",
                        as: "serviceDetails",
                    },
                },
                {
                    $lookup: {
                        from: "workers",
                        localField: "servicedBy",
                        foreignField: "_id",
                        as: "workerDetails",
                    },
                },
                {
                    $addFields: {
                        serviceDetail: { $arrayElemAt: ["$serviceDetails", 0] },
                    },
                },
                {
                    $lookup: {
                        from: "customers",
                        localField: "serviceDetail.customerId",
                        foreignField: "_id",
                        as: "customerDetails",
                    },
                },
                {
                    $addFields: {
                        customerDetail: {
                            $arrayElemAt: ["$customerDetails", 0],
                        },
                    },
                },
                { $match: filter2 },

                {
                    $project: {
                
                        customerDetails: 0,
                        serviceDetails: 0,
                    },
                },
                { $sort: { createdAt: -1 } },
                { $skip: Number(skip) * Number(limit) },
                { $limit: Number(limit) },
            ].filter(Boolean);

            const reports = await GenerateService.aggregate(
                aggregationPipeline
            );

            const pdfBuffer = await createSericesPdf({ reports });

            // // Verify PDF buffer
            // if (!Buffer.isBuffer(pdfBuffer) || pdfBuffer.length === 0) {
            //     console.error("Invalid or empty PDF buffer");
            //     return res.status(500).send("Failed to generate PDF");
            // }

            // Set headers and send buffer
            res.set({
                "Content-Type": "application/pdf",
                "Content-Disposition":
                    "attachment; filename=companyDetails.pdf",
            });

            console.log("Sending PDF buffer...");
            res.send(pdfBuffer);
        } catch (err) {}
    },
};
