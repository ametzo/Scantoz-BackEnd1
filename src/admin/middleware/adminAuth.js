const jwt = require("jsonwebtoken");
const sendErrorResponse = require("../../helper/sendErrorResponse");
const { Admin } = require("../../models");

const checkPermission = (permission) => {
    return async (req, res, next) => {
        try {
            // Step 1: Get token from headers
            const token = req.headers.authorization?.split(" ")[1];
            if (!token) {
                return sendErrorResponse(res, 401, "Token missing");
            }

            // Step 2: Verify token and decode it
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Step 3: Find admin by decoded _id and token (ensuring it's not expired or invalid)
            const admin = await Admin.findOne({
                _id: decoded._id,
                jwtToken: token,
            }).populate("role");

            if (!admin) {
                return sendErrorResponse(res, 401, "Invalid Token");
            }

            // Step 4: Check if the admin has the required permission
            const adminRoles = admin.role;
            let hasPermission = false;

            for (let j = 0; j < adminRoles?.roles?.length; j++) {
                if (
                    // adminRoles?.roles[j]?.name === name &&
                    adminRoles?.roles[j]?.permissions?.includes(permission)
                ) {
                    hasPermission = true;
                    break;
                }
            }

            // Step 5: If permission granted, proceed to the next middleware
            if (hasPermission) {
                req.admin = admin;
                next();
            } else {
                return sendErrorResponse(res, 403, "Permission denied");
            }
        } catch (err) {
            return sendErrorResponse(res, 401, err.message || "Unauthorized");
        }
    };
};

module.exports = checkPermission;
