const { isValidObjectId } = require("mongoose");
const sendErrorResponse = require("../../../helper/sendErrorResponse");
const { Service, GenerateService } = require("../../../models");
const {
    serviceApprovalSchema,
} = require("../validations/serviceApproval.schema");

module.exports = {
    getServices: async (req, res) => {
        try {
            const {
                skip = 0,
                limit = 10,
                searchQuery,
                startDate,
                endDate,
                status,
            } = req.query;

            // const filters = { customerId: req.user.customerId._id };
            const filters = {};

            // if (searchQuery && searchQuery !== "") {
            //     filters.$or = [
            //         { project: { $regex: searchQuery, $options: "i" } },
            //     ];
            // }

            if (status && status !== "") {
                filters.status = status;
            }

            if (
                (startDate && startDate !== "") ||
                (endDate && endDate !== "")
            ) {
                filters.serviceDate = {};
                if (startDate) {
                    filters.serviceDate.$gte = new Date(startDate); // Greater than or equal to startDate
                }

                if (endDate) {
                    filters.serviceDate.$lte = new Date(endDate); // Less than or equal to endDate
                }
            }

            const aggregationPipeline = [
                {
                    $match: filters,
                },
                {
                    $lookup: {
                        from: "services",
                        localField: "serviceId",
                        foreignField: "_id",
                        as: "service",
                    },
                },
                {
                    $set: {
                        projectDetail: { $arrayElemAt: ["$service", 0] },
                    },
                },
                {
                    $lookup: {
                        from: "workers",
                        localField: "servicedBy",
                        foreignField: "_id",
                        as: "workers",
                        pipeline: [
                            {
                                $project: {
                                    _id: 0,
                                    employeeName: 1,
                                    address: 1,
                                    phone: 1,
                                }, // Keep only employeeName
                            },
                        ],
                    },
                },
                {
                    $lookup: {
                        from: "customers",
                        localField: "projectDetail.customerId",
                        foreignField: "_id",
                        as: "customer",
                    },
                },
                {
                    $set: {
                        customer: { $arrayElemAt: ["$customer", 0] },
                    },
                },
                {
                    $match: { "customer._id": req.user.customerId._id }, // Access _id from the first customer array element
                },
                {
                    $sort: {
                        createdAt: -1,
                    },
                },
                {
                    $project: {
                        _id: 1,
                        projectNo: 1,
                        serviceDate: 1,
                        status: 1,
                        serviceTime: 1,
                        image: 1,
                        signedBy: 1,
                        signedTime: 1,
                        projectDetail: {
                            project: 1,
                            startDate: 1,
                            endDate: 1,
                            description: 1,
                        },
                        workers: 1,
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalServices: { $sum: 1 },
                        data: { $push: "$$ROOT" },
                    },
                },
                {
                    $project: {
                        totalServices: 1,
                        data: {
                            $slice: [
                                "$data",
                                Number(limit) * Number(skip),
                                Number(limit),
                            ],
                        },
                    },
                },
            ];

            const services = await GenerateService.aggregate(
                aggregationPipeline
            );

            res.status(200).json({
                services: services[0]?.data || [],
                totalServices: services[0]?.totalServices || 0,
                skip: Number(skip),
                limit: Number(limit),
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getSingleServiceDetails: async (req, res) => {
        try {
            const { id } = req.params;

            const generatedServices = await GenerateService.findOne({
                _id: id,
            }).populate("servicedBy", "employeeName address phone ");

            res.status(200).json(generatedServices);
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    updateGeneratedService: async (req, res) => {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "Invalid service ID");
            }

            const { _, error } = serviceApprovalSchema.validate(req.body);
            if (error) {
                return sendErrorResponse(res, 400, error.details[0].message);
            }

            let image;
            if (!req.file?.path) {
                return sendErrorResponse(res, 400, "service image is required");
            } else {
                image = "/" + req.file.path.replace(/\\/g, "/");
            }

            const findGeneratedService = await GenerateService.findOne({
                _id: id,
                isDeleted: false,
                status: "approved",
            });

            if (!findGeneratedService?.status === "approved") {
                return sendErrorResponse(res, 400, "service already approved ");
            }

            const generatedService = await GenerateService.findOneAndUpdate(
                { _id: id, isDeleted: false },
                {
                    ...req.body,
                    image,
                    status: "approved",
                },
                { new: true, runValidators: true }
            );

            if (!generatedService) {
                return sendErrorResponse(res, 400, "service not found");
            }

            res.status(200).json({
                message: "Service created successfully",
                _id: generatedService._id,
            });
        } catch (err) {
            console.log(err);
            sendErrorResponse(res, 500, err);
        }
    },
};
