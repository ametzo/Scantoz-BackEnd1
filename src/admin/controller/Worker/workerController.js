const { isValidObjectId } = require("mongoose");
const sendErrorResponse = require("../../../helper/sendErrorResponse");
const { Worker } = require("../../../models");
const {
    addWorkerSchema,
} = require("../../validations/worker/addWorker.schema");

module.exports = {
    addnewWorkers: async (req, res) => {
        try {
            const {
                employeeName,
                address,
                phone,
                // jobTitle,
                // email,
                // location,
                // joinDate,
                // expDate,
                // emergencyName,
                // salary,
                // emergencyPhone,
                // userId,
                // password,
                // bankAccount,
            } = req.body;

            const { _, error } = addWorkerSchema.validate(req.body);
            if (error) {
                return sendErrorResponse(res, 400, error.details[0].message);
            }

            const newWorker = new Worker({
                ...req.body,
                isDeleted: false,
                isActive: true,
            });
            await newWorker.save();

            res.status(200).json({
                message: "new  worker successfully added",
                _id: newWorker?._id,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    updateWorkers: async (req, res) => {
        try {
            const { id } = req.params;
            const {
                employeeName,
                address,
                phone,
                // jobTitle,
                // email,
                // location,
                // joinDate,
                // expDate,
                // emergencyName,
                // salary,
                // emergencyPhone,
                // userId,
                // password,
                // bankAccount,
            } = req.body;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "invalid workersid");
            }

            const { _, error } = addWorkerSchema.validate(req.body);
            if (error) {
                return sendErrorResponse(res, 400, error.details[0].message);
            }

            const worker = await Worker.findOneAndUpdate(
                {
                    _id: id,
                    isDeleted: false,
                },
                {
                    employeeName,
                    address,
                    phone,
                    // jobTitle,
                    // email,
                    // location,
                    // joinDate,
                    // expDate,
                    // emergencyName,
                    // salary,
                    // emergencyPhone,
                    // userId,
                    // password,
                    // bankAccount,
                },
                { runValidators: true, new: true }
            );
            if (!worker) {
                return sendErrorResponse(res, 404, "Workers not found");
            }

            res.status(200).json({
                message: " worker successfully updated",
                _id: id,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    deleteWorkers: async (req, res) => {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "invalid workersid");
            }

            const worker = await Worker.findOneAndUpdate(
                {
                    _id: id,
                    isDeleted: false,
                },
                { $set: { isDeleted: true } }
            );
            if (!worker) {
                return sendErrorResponse(res, 404, "Workers not found");
            }

            res.status(200).json({
                message: " worker successfully deleted",
                _id: id,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getAllWorkers: async (req, res) => {
        try {
            const { skip = 0, limit = 10, searchQuery } = req.query;

            const filters = { isDeleted: false };

            if (searchQuery && searchQuery !== "") {
                filters.employeeName = { $regex: searchQuery, $options: "i" };
            }

            const workers = await Worker.find(filters)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(limit * skip)
                .lean();

            const totalWorkers = await Worker.countDocuments(filters);

            res.status(200).json({
                workers,
                totalWorkers,
                skip: Number(skip),
                limit: Number(limit),
            });
        } catch (err) {
            console.log(err);
            sendErrorResponse(res, 500, err);
        }
    },

    getSingleWorkers: async (req, res) => {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "invalid workersid");
            }

            const worker = await Worker.findOne({
                isDeleted: false,
                _id: id,
            });
            if (!worker) {
                return sendErrorResponse(res, 404, "Workers not found");
            }

            res.status(200).json(worker);
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getWorkerList: async (req, res) => {
        try {
            const workers = await Worker.find({
                isDeleted: false,
            }).select("employeeName");

            res.status(200).json(workers);
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },
};
