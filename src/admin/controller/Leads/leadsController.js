const { isValidObjectId } = require("mongoose");
const sendErrorResponse = require("../../../helper/sendErrorResponse");
const { Lead, LeadComment } = require("../../../models");
const { addLeadSchema } = require("../../validations/Leads/addLead.schema");

module.exports = {
    addNewLeads: async (req, res) => {
        try {
            const {
                date,
                name,
                company,
                phone,
                email,
                city,
                calledBy,
                userStatus,
                assigned,
                description,
            } = req.body;

            const { _, error } = addLeadSchema.validate(req.body);
            if (error) {
                return sendErrorResponse(res, 400, error.details[0].message);
            }

            const newLead = new Lead({
                ...req.body,
                isDeleted: false,
                isActive: true,
            });
            await newLead.save();

            res.status(200).json({
                message: "new lead successfully added",
                _id: newLead?._id,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    updateLeads: async (req, res) => {
        try {
            const { id } = req.params;
            const {
                date,
                name,
                company,
                phone,
                email,
                city,
                calledBy,
                userStatus,
                assigned,
                description,
            } = req.body;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "invalid Leads id");
            }

            const { _, error } = addLeadSchema.validate(req.body);
            if (error) {
                return sendErrorResponse(res, 400, error.details[0].message);
            }

            const lead = await Lead.findOneAndUpdate(
                {
                    _id: id,
                    isDeleted: false,
                },
                {
                    date,
                    name,
                    company,
                    phone,
                    email,
                    city,
                    calledBy,
                    userStatus,
                    assigned,
                    description,
                },
                { runValidators: true, new: true }
            );
            if (!lead) {
                return sendErrorResponse(res, 404, "Leads not found");
            }

            res.status(200).json({
                message: "lead successfully updated",
                _id: id,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    deleteLeads: async (req, res) => {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "invalid Leads id");
            }

            const lead = await Lead.findOneAndUpdate(
                {
                    _id: id,
                    isDeleted: false,
                },
                { $set: { isDeleted: true } }
            );

            if (!lead) {
                return sendErrorResponse(res, 404, "Leads not found");
            }

            res.status(200).json({
                message: "Lead successfully deleted",
                _id: id,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getAllLeads: async (req, res) => {
        try {
            const {
                skip = 0,
                limit = 10,
                fromDate,
                toDate,
                searchQuery,
            } = req.query;

            const filters = { isDeleted: false };

            if (req.admin.adminRole !== "super-admin") {
                filters["assigned"] = req.admin?._id;
            }

            if (searchQuery && searchQuery !== "") {
                filters.$or = [
                    { name: { $regex: searchQuery, $options: "i" } },
                    { company: { $regex: searchQuery, $options: "i" } },
                ];
            }

            if (fromDate || toDate) {
                if (fromDate && toDate) {
                    filters.$and = [
                        { createdAt: { $gte: new Date(fromDate) } },
                        { createdAt: { $lte: new Date(toDate) } },
                    ];
                } else if (fromDate) {
                    filters["createdAt"] = { $gte: new Date(fromDate) };
                } else if (toDate) {
                    filters["createdAt"] = { $lte: new Date(toDate) };
                }
            }

            const leads = await Lead.find(filters)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(limit * skip)
                .lean();

            const totalLeads = await Lead.countDocuments(filters);

            res.status(200).json({
                leads,
                totalLeads,
                skip: Number(skip),
                limit: Number(limit),
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getSingleLeads: async (req, res) => {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "invalid Leads id");
            }

            const lead = await Lead.findOne({
                isDeleted: false,
                _id: id,
            });
            if (!lead) {
                return sendErrorResponse(res, 404, "leads not found");
            }

            res.status(200).json(lead);
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getLeadComments: async (req, res) => {
        try {
            const { id } = req.params;

            console.log(id, "id");

            const leadComments = await LeadComment.find({
                // isDeleted: false,
                leadId: id,
            })
                .sort({ createdAt: -1 })
                .populate("createdBy", "name");

            res.status(200).json(leadComments);
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    updateLeadComments: async (req, res) => {
        try {
            const { text, leadId } = req.body;

            if (!text) {
                return sendErrorResponse(res, 400, "text is required");
            }

            if (!isValidObjectId(leadId)) {
                return sendErrorResponse(res, 400, "Invalid lead id");
            }

            const newLeadComment = new LeadComment({
                text: text,
                leadId: leadId,
                createdBy: req.admin,
                isDeleted: false,
                isActive: true,
            });
            await newLeadComment.save();

            const populatedLeadComment = await LeadComment.findById(
                newLeadComment._id
            ).populate("createdBy");

            res.status(200).json(populatedLeadComment);
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    leadUserAssigin: async (req, res) => {
        try {
            const { id } = req.params;

            const { assigned } = req.body;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "invalid Leads id");
            }

            const lead = await Lead.findOneAndUpdate(
                {
                    isDeleted: false,
                    _id: id,
                },
                {
                    $set: { assigned },
                }
            );
            if (!lead) {
                return sendErrorResponse(res, 404, "leads not found");
            }

            res.status(200).json(lead);
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    updateLeadStatus: async (req, res) => {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "invalid Supportsid");
            }

            const { status } = req.body;

            if (!status) {
                return sendErrorResponse(res, 400, " Lead status required");
            }

            const lead = await Lead.findOneAndUpdate(
                {
                    _id: id,
                    isDeleted: false,
                },
                { $set: { userStatus: status } }
            );

            if (!lead) {
                return sendErrorResponse(res, 404, "Leads not found");
            }

            res.status(200).json({
                message: "Lead successfully updated",
                _id: id,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },
};
