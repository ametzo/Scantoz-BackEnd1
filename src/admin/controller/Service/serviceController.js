const { isValidObjectId } = require("mongoose");
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

module.exports = {
    addnewServices: async (req, res) => {
        try {
            const {
                customerId,
                project,

                startDate,
                endDate,
                description,
            } = req.body;

            const { _, error } = addServiceSchema.validate(req.body);
            if (error) {
                return sendErrorResponse(res, 400, error.details[0].message);
            }

            const newService = new Service({
                ...req.body,
                isDeleted: false,
                isActive: true,
            });
            await newService.save();

            res.status(200).json({
                message: "new service successfully added",
                _id: newService?._id,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    updateServices: async (req, res) => {
        try {
            const { id } = req.params;
            const {
                customerId,
                project,

                startDate,
                endDate,
                description,
            } = req.body;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "invalid services id");
            }

            const { _, error } = addServiceSchema.validate(req.body);
            if (error) {
                return sendErrorResponse(res, 400, error.details[0].message);
            }

            const service = await Service.findOneAndUpdate(
                {
                    _id: id,
                    isDeleted: false,
                },
                {
                    customerId,
                    project,

                    startDate,
                    endDate,
                    description,
                },
                { runValidators: true, new: true }
            );
            if (!service) {
                return sendErrorResponse(res, 404, "services not found");
            }

            res.status(200).json({
                message: "service successfully updated",
                _id: id,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    deleteServices: async (req, res) => {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "invalid services id");
            }

            const service = await Service.findOneAndUpdate(
                {
                    _id: id,
                    isDeleted: false,
                },
                { $set: { isDeleted: true } }
            );

            if (!service) {
                return sendErrorResponse(res, 404, "services not found");
            }

            res.status(200).json({
                message: "service successfully deleted",
                _id: id,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getAllServices: async (req, res) => {
        try {
            const {
                skip = 0,
                limit = 10,
                searchQuery,
                customerId,
                toDate,
                fromDate,
            } = req.query;

            const filters = { isDeleted: false };

            if (searchQuery && searchQuery !== "") {
                filters.project = { $regex: searchQuery, $options: "i" };
            }

            if (customerId && customerId !== "") {
                filters.customerId = customerId;
            }

            if (fromDate || toDate) {
                if (fromDate && toDate) {
                    filters.$and = [
                        { startDate: { $gte: new Date(fromDate) } },
                        { endDate: { $lte: new Date(toDate) } },
                    ];
                } else if (fromDate) {
                    filters["startDate"] = { $gte: new Date(fromDate) };
                } else if (toDate) {
                    filters["endDate"] = { $lte: new Date(toDate) };
                }
            }

            const services = await Service.find(filters)
                .populate("customerId")
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(limit * skip)
                .lean();

            const totalservices = await Service.countDocuments(filters);

            res.status(200).json({
                services,
                totalservices,
                skip: Number(skip),
                limit: Number(limit),
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getSingleServices: async (req, res) => {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "invalid services id");
            }

            const service = await Service.findOne({
                isDeleted: false,
                _id: id,
            }).populate("customerId");

            if (!service) {
                return sendErrorResponse(res, 404, "services not found");
            }

            const generatedServices = await GenerateService.find({
                isDeleted: false,
                serviceId: id,
            })
                .populate("servicedBy", "employeeName	")
                ?.sort({ createdAt: -1 });

            res.status(200).json({ service, generatedServices });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    generateNewService: async (req, res) => {
        try {
            const { status, serviceId, servicedBy, projectNo, serviceDate } =
                req.body;
            const { _, error } = serviceValidationSchema.validate(req.body);
            if (error) {
                return sendErrorResponse(res, 400, error.details[0].message);
            }

            const service = await Service.findOne({
                _id: serviceId,
                isDeleted: false,
            }).populate("customerId");

            if (!service) {
                return sendErrorResponse(res, 404, "Service not found");
            }

            const workers = await Worker.find({
                _id: servicedBy,
                isDeleted: false,
            });

            console.log(workers, "workers");

            if (!workers) {
                return sendErrorResponse(res, 404, "Worker not found");
            }

            const formattedServiceDate = new Date(
                serviceDate
            ).toLocaleDateString("en-US");

            const newService = new GenerateService({
                ...req.body,
                isDeleted: false,
                isActive: true,
            });
            await newService.save();

            const user = await CustomerEmployee.find({
                customerId: service.customerId,
            });

            console.log(user, service, "users");

            sendPushNotificationByEmail({
                playerIds: user.map((user) => user?._id.toString()), // Corrected mapping
                title: "New Service Update",
                message: `New service was completed on ${formattedServiceDate}. Please check and sign.`,
                data: {
                    _id: newService?._id,
                    projectNo,
                    project: service?.project,
                    serviceDate: formattedServiceDate,
                },
            });

            res.status(200).json({
                message: "New service successfully added",
                _id: newService?._id,
                newService,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getAllServicesByCompany: async (req, res) => {
        try {
            const { customerId } = req.params;
            const filters = { isDeleted: false };

            if (customerId && customerId !== "") {
                filters.customerId = customerId;
            }

            const services = await Service.find(filters).select("project");

            res.status(200).json(services);
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },
};
