const jwt = require("jsonwebtoken");
const sendErrorResponse = require("../../helper/sendErrorResponse");
const { Admin } = require("../../models");

// Static role-path mapping (admin paths mapped to specific role numbers)
const pathToRole = {
    roles: 1001,
    auth: 1002,
    leads: 1003,
    customers: 1004,
    workers: 1005,
    services: 1006,
    reports: 1007,
    supports: 1008,
};

// Map HTTP methods to permissions
const methodToPermission = {
    POST: "create",
    PATCH: "update",
    GET: "view",
    DELETE: "delete",
};

function checkPermission(defaultPermission = false) {
    return async function (req, res, next) {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            if (!token) {
                return sendErrorResponse(res, 401, "Token not provided");
            }

            const decode = jwt.verify(token, process.env.JWT_SECRET);
            const admin = await Admin.findOne({
                _id: decode._id,
                // jwtToken: token,
            })
                .populate("role")
                .lean();

            if (!admin) {
                return sendErrorResponse(res, 401, "Invalid token");
            }

            if (defaultPermission) {
                req.admin = admin;
                return next();
            }

            const adminRoles = admin.role;
            let hasPermission = false;

            // Extract the part after /admin/ from the route path
            const pathSegment = req.originalUrl.split("/")[4]; // e.g., 'auth', 'roles', etc.

            // Check if the path is in the static role mapping
            const currentRouteRoleNo = pathToRole[pathSegment];

            if (!currentRouteRoleNo) {
                return sendErrorResponse(
                    res,
                    404,
                    "Route not found in role mapping"
                );
            }

            // Determine required permission based on HTTP method
            const requiredPermission = methodToPermission[req.method];
            if (!requiredPermission) {
                return sendErrorResponse(res, 400, "Invalid HTTP method");
            }

            // Check if the admin has permission for the role
            for (let j = 0; j < adminRoles?.roles?.length; j++) {
                const role = adminRoles.roles[j];

                // If the role's stepNumber matches the mapped role number and includes the required permission
                if (
                    role.stepNumber === currentRouteRoleNo &&
                    role.permissions.includes(requiredPermission)
                ) {
                    hasPermission = true;
                    break;
                }
            }

            if (hasPermission) {
                req.admin = admin;
                return next();
            } else {
                return res.status(401).json({ error: "Permission denied" });
            }
        } catch (err) {
            console.log(err, "error called");
            return sendErrorResponse(res, 401, err.message || err);
        }
    };
}

module.exports = checkPermission;
