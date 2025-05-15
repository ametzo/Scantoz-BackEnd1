const { isValidObjectId } = require("mongoose");
const sendErrorResponse = require("../../../helper/sendErrorResponse");
const userRole = require("../../../helper/userRole");
const { AdminRole } = require("../../../models");
const {
    adminRoleSchema,
} = require("../../validations/adminRoles/adminRoles.schema");

module.exports = {
    createNewAdminRole: async (req, res) => {
        try {
            const { _, error } = adminRoleSchema.validate(req.body);
            if (error) {
                return sendErrorResponse(res, 400, error.details[0].message);
            }

            const newAdminRole = new AdminRole({
                ...req.body,
            });
            await newAdminRole.save();

            res.status(200).json(newAdminRole);
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    updateAdminRole: async (req, res) => {
        try {
            const { id } = req.params;

            const { _, error } = adminRoleSchema.validate(req.body);
            if (error) {
                return sendErrorResponse(res, 400, error.details[0].message);
            }

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "invalid admin role id");
            }

            const adminRole = await AdminRole.findOneAndUpdate(
                {
                    _id: id,
                },
                { ...req.body },
                { runValidators: true, new: true }
            );
            if (!adminRole) {
                return sendErrorResponse(res, 404, "admin role not found");
            }

            res.status(200).json(adminRole);
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getAllRoles: async (req, res) => {
        try {
            const { skip = 0, limit = 10, searchQuery } = req.query;

            const filters = { isDeleted: false };
            if (searchQuery && searchQuery !== "") {
                filters.roleName = { $regex: searchQuery, $options: "i" };
            }

            const adminRoles = await AdminRole.find(filters)
                .select("roleName description")
                .populate("adminsCount")
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(limit * skip)
                .lean();

            const totalAdminRoles = await AdminRole.countDocuments(filters);

            res.status(200).json({
                adminRoles,
                totalAdminRoles,
                skip: Number(skip),
                limit: Number(limit),
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getAllRoleNames: async (req, res) => {
        try {
            const adminRoles = await AdminRole.find({})
                .select("roleName")
                .sort({ name: 1 });
            // .collation({ locale: "en", caseLevel: true });

            res.status(200).json(adminRoles);
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    deleteAdminRole: async (req, res) => {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "invalid admin role id");
            }

            const adminRole = await AdminRole.findOneAndUpdate(
                {
                    _id: id,
                    isDeleted: false,
                },
                { $set: { isDeleted: true } }
            );

            if (!adminRole) {
                return sendErrorResponse(res, 404, "admin role not found");
            }

            res.status(200).json({
                message: "admin role successfully deleted",
                _id: id,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getSingleAdminRole: async (req, res) => {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "invalid admin role id");
            }

            const adminRole = await AdminRole.findOne({ _id: id });
            if (!adminRole) {
                return sendErrorResponse(res, 404, "admin role not found");
            }

            res.status(200).json(adminRole);
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getSingleAdminRoleAdminList: async (req, res) => {
        try {
            const { skip = 0, limit = 10, searchQuery } = req.query;
            const { roleId } = req.params;

            const filters = {};
            if (searchQuery && searchQuery !== "") {
                filters.$or = [
                    { name: { $regex: searchQuery, $options: "i" } },
                    { email: { $regex: searchQuery, $options: "i" } },
                ];
            }

            if (roleId && roleId !== "") {
                filters.roles = { $in: [roleId] };
            }

            const adminRole = await AdminRole.findOne({ _id: roleId });
            if (!adminRole) {
                return sendErrorResponse(res, 404, "admin role not found");
            }

            const admins = await Admin.find(filters)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(limit * skip)
                .populate("roles", "roleName")
                .lean();

            const totalAdmins = await Admin.find(filters).count();

            res.status(200).json({
                admins,
                totalAdmins,
                skip: Number(skip),
                limit: Number(limit),
                role: adminRole.roleName,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getUserRoles: async (req, res) => {
        try {
            const processArray = Object.values(userRole);

            // Send the array as the response
            res.status(200).json(processArray);
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getSingleUserRoles: async (req, res) => {
        try {
            const { id } = req.params; // Assuming the id is passed as a URL parameter

            // Step 1: Fetch the admin role from the database by id
            const adminRole = await AdminRole.findOne({ _id: id });
            if (!adminRole) {
                return sendErrorResponse(res, 404, "Admin role not found");
            }

            // Step 2: Extract all userRoles from the predefined roles
            const processArray = Object.values(userRole); // predefined roles object

            // Step 3: Iterate over all the predefined roles and match with the database roles
            const rolesWithPermissions = processArray.map((role) => {
                // Find the matching role from the database using stepNumber
                const dbRole = adminRole.roles.find(
                    (dbRole) => dbRole.stepNumber === role.stepNumber
                );

                // If a match is found, return the role with permissions from the database
                if (dbRole) {
                    return {
                        ...role, // All fields from the predefined role
                        permissions: dbRole.permissions, // Permissions from the database
                    };
                }

                return {
                    ...role,

                    permissions: [],
                };
            });

            // Step 4: Return the roles with all fields (and permissions)
            res.status(200).json({
                message: "User roles with permissions",
                name: adminRole.roleName,
                description: adminRole.description,
                roles: rolesWithPermissions,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },
};
