const { hash, compare } = require("bcryptjs");
const crypto = require("crypto");
const { isValidObjectId } = require("mongoose");
const fs = require("fs");
const { parse } = require("csv-parse");
const jwt = require("jsonwebtoken");

const {
    adminAddSchema,
    adminLoginSchema,
    adminPasswordUpdateSchema,
} = require("../../validations/adminAuth.schema");
const sendErrorResponse = require("../../../helper/sendErrorResponse");
const Admin = require("../../../models/admin.model");

module.exports = {
    addNewAdmin: async (req, res) => {
        try {
            const {
                name,
                userId,
                email,
                phoneNumber,
                password,
                role,
                adminRole,
            } = req.body;

            const { _, error } = adminAddSchema.validate({
                ...req.body,
            });
            if (error) {
                return sendErrorResponse(
                    res,
                    400,
                    error.details ? error.details[0].message : error.message
                );
            }

            const admin = await Admin.findOne({
                $or: [{ email: email }, { userId: userId }],
            });
            if (admin) {
                return sendErrorResponse(
                    res,
                    400,
                    "email or userId already exists"
                );
            }

            const hashedPassowrd = await hash(password, 8);

            const newAdmin = new Admin({
                name,
                userId,
                email,
                phoneNumber,
                joinedDate: new Date(),
                password: hashedPassowrd,
                role,
                adminRole,
            });
            await newAdmin.save();

            res.status(200).json(newAdmin);
        } catch (err) {
            console.log(err);

            sendErrorResponse(res, 500, err);
        }
    },

    adminLogin: async (req, res) => {
        try {
            const { userId, password } = req.body;

            const { _, error } = adminLoginSchema.validate(req.body);
            if (error) {
                return sendErrorResponse(res, 400, error.details[0].message);
            }

            const admin = await Admin.findOne({ userId }).populate("role");
            if (!admin) {
                return sendErrorResponse(
                    res,
                    400,
                    "Account not found. Invalid credentials"
                );
            }

            const isMatch = await compare(password, admin.password);
            if (!isMatch) {
                return sendErrorResponse(
                    res,
                    400,
                    "Account not found. Invalid credentials"
                );
            }

            const jwtToken = await admin.generateAuthToken();

            const refreshToken = jwt.sign(
                { adminId: admin._id },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            admin.refreshToken = refreshToken;
            admin.lastLoggedIn = new Date();
            await admin.save();

            res.cookie("refreshToken", refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            res.status(200).json({ admin, jwtToken });
        } catch (err) {
            console.log(err);
            sendErrorResponse(res, 500, err);
        }
    },

    refreshAdminToken: async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                return sendErrorResponse(res, 401, "Refresh token is required");
            }

            const decoded = await jwt.verify(
                refreshToken,
                process.env.JWT_SECRET
            );

            if (!decoded) {
                return sendErrorResponse(res, 401, "Invalid refresh token");
            }

            const admin = await Admin.findById(decoded?.adminId);
            if (!admin || admin.refreshToken !== refreshToken) {
                return sendErrorResponse(res, 401, "Invalid refresh token");
            }

            const newAccessToken = await admin.generateAuthToken();

            res.json({
                jwtToken: newAccessToken,
                // refreshToken,
            });
        } catch (err) {
            console.error("Error refreshing admin token:", err);
            sendErrorResponse(
                res,
                500,
                err.message || "An error occurred while refreshing the token"
            );
        }
    },
    sessionAdminToken: async (req, res) => {
        try {
            const { accessToken } = req.params;

            if (!accessToken) {
                return sendErrorResponse(res, 401, "Access token is required");
            }

            const decoded = await jwt.verify(
                accessToken,
                process.env.JWT_SECRET
            );
            
            if (!decoded) {
                return sendErrorResponse(res, 401, "Invalid access token");
            }

            const admin = await Admin.findById({ _id: decoded._id }).populate(
                "role"
            );
            if (!admin) {
                return sendErrorResponse(res, 401, "Admin not found");
            }

            const newAccessToken = await admin.generateAuthToken();

            const refreshToken = jwt.sign(
                { adminId: admin._id },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            res.cookie("refreshToken", refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

         
            res.status(200).json({ admin, jwtToken: newAccessToken });
        } catch (err) {
            console.error("Error refreshing admin token:", err);
            sendErrorResponse(
                res,
                500,
                err.message || "An error occurred while refreshing the token"
            );
        }
    },

    getAllAdmins: async (req, res) => {
        try {
            const { skip = 0, limit = 10, searchQuery } = req.query;

            const filters = {};
            if (searchQuery && searchQuery !== "") {
                filters.$or = [
                    { name: { $regex: searchQuery, $options: "i" } },
                    { email: { $regex: searchQuery, $options: "i" } },
                ];
            }

            const admins = await Admin.find(filters)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(limit * skip)
                .populate("role", "roleName")
                .lean();

            const totalAdmins = await Admin.countDocuments(filters);

            res.status(200).json({
                admins,
                totalAdmins,
                skip: Number(skip),
                limit: Number(limit),
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    deleteAdmin: async (req, res) => {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "Invalid admin id");
            }

            const admin = await Admin.findOneAndUpdate(
                {
                    _id: id,
                    isDeleted: false,
                },
                { $set: { isDeleted: true } }
            );

            if (!admin) {
                return sendErrorResponse(res, 404, "Admin not found");
            }

            res.status(200).json({
                message: "Admin deleted successfully",
                _id: id,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getAdmin: async (req, res) => {
        try {
            res.status(200).json(req.admin);
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    updateAdminDetails: async (req, res) => {
        try {
            const {
                email,
                name,
                userId,
                password,
                phoneNumber,
                role,
                adminRole,
            } = req.body;

            const hashedPassowrd = await hash(password, 8);

            const admin = await Admin.findOneAndUpdate(
                { _id: req.admin?._id },
                {
                    userId,
                    email,
                    name,
                    phoneNumber,
                    password: hashedPassowrd,
                    role,
                    adminRole,
                },
                { runValidators: true, new: true }
            );

            if (!admin) {
                return sendErrorResponse(res, 404, "Admin not found");
            }

            const adminDetails = await Admin.findOne({ _id: req.admin?._id })
                .populate("roles")
                .lean();

            res.status(200).json(adminDetails);
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    updateAdminPassword: async (req, res) => {
        try {
            const { oldPassword, newPassword } = req.body;

            const { _, error } = adminPasswordUpdateSchema.validate(req.body);
            if (error) {
                return sendErrorResponse(
                    res,
                    400,
                    error.details ? error?.details[0]?.message : error.message
                );
            }

            const isMatch = await compare(oldPassword, req.admin.password);
            if (!isMatch) {
                return sendErrorResponse(res, 400, "Old password is incorrect");
            }

            const hashedPassowrd = await hash(newPassword, 8);
            const admin = await Admin.findOneAndUpdate(
                { _id: req.admin._id },
                { password: hashedPassowrd }
            );

            if (!admin) {
                return sendErrorResponse(res, 404, "User not found");
            }

            res.status(200).json({ message: "Password updated successfully" });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getSingleAdmin: async (req, res) => {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "Invalid admin id");
            }

            const admin = await Admin.findById(id);
            if (!admin) {
                return sendErrorResponse(res, 404, "Admin not found");
            }

            res.status(200).json(admin);
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    updateSingleAdmin: async (req, res) => {
        try {
            const { id } = req.params;
            const {
                name,
                userId,
                email,
                phoneNumber,
                password,
                role,
                adminRole,
            } = req.body;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "Invalid admin id");
            }

            const { _, error } = adminAddSchema.validate({
                ...req.body,
            });
            if (error) {
                return sendErrorResponse(
                    res,
                    400,
                    error.details ? error.details[0].message : error.message
                );
            }

            let updatedFields = {
                userId,
                email,
                name,
                phoneNumber,
                role,
                adminRole,
            };

            if (password) {
                const hashedPassword = await hash(password, 8);
                updatedFields.password = hashedPassword;
            }

            const admin = await Admin.findOneAndUpdate(
                { _id: id },
                {
                    ...updatedFields,
                },
                { runValidators: true, new: true }
            );

            if (!admin) {
                return sendErrorResponse(res, 404, "Admin not found");
            }

            res.status(200).json({
                message: "Admin details succesfully updated",
                _id: id,
                admin: admin,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    addQtnAdminsFromCsv: async (req, res) => {
        try {
            if (!req.file) {
                return sendErrorResponse(res, 500, "CSV file is required");
            }

            let csvRow = 0;
            let adminsList = [];
            let newAdmins = [];
            let errorAdmins = [];
            const uploadAndCreateAdmins = async () => {
                for (let i = 0; i < adminsList?.length; i++) {
                    try {
                        const password = crypto.randomBytes(6).toString("hex");
                        const hashedPassowrd = await hash(password, 8);

                        const admin = await Admin.findOneAndUpdate(
                            {
                                email: adminsList[i].email,
                            },
                            {
                                name: adminsList[i].name,
                                email: adminsList[i].email,
                                phoneNumber: adminsList[i].phoneNumber,
                                designation: adminsList[i].designation,
                                country: adminsList[i].country,
                                password: hashedPassowrd,
                                roles: ["64db315e71dfc6f8354c863f"],
                            },
                            { new: true, runValidators: true, upsert: true }
                        );

                        newAdmins.push(Object(admin));

                        sendQtnWelcomeEmail({
                            email: adminsList[i].email,
                            password,
                        });
                    } catch (err) {
                        console.log(err);
                        errorAdmins.push(adminsList[i]?.email);
                    }
                }
            };

            fs.createReadStream(req.file?.path)
                .pipe(parse({ delimiter: "," }))
                .on("data", async function (csvrow) {
                    if (csvRow !== 0) {
                        adminsList.push({
                            name: csvrow[0],
                            designation: csvrow[1],
                            country: csvrow[2],
                            phoneNumber: csvrow[3],
                            email: csvrow[4],
                        });
                    }
                    csvRow += 1;
                })
                .on("end", async function () {
                    await uploadAndCreateAdmins();

                    if (errorAdmins?.length > 0) {
                        return res.status(200).json({
                            status: "error",
                            message: `${errorAdmins} not uploaded, please try with correct details`,
                            newAdmins,
                        });
                    }

                    res.status(200).json({
                        message: "Tickets successfully uploaded",
                        status: "ok",
                        newAdmins,
                    });
                })
                .on("error", function (err) {
                    sendErrorResponse(
                        res,
                        400,
                        "Something went wrong, Wile parsing CSV"
                    );
                });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getAllAdminsList: async (req, res) => {
        try {
            const admins = await Admin.find({}).select("name");

            res.status(200).json(admins);
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },
    updatePlayerId: async (req, res) => {
        try {
            const { playerId } = req.body;

            const usersWithSamePlayerId = await Admin.find({
                playerId,
            });


            const admin = await Admin.findOne({ _id: req.admin.id });

            if (!admin) {
                return sendErrorResponse(res, 400, "Invalid user");
            }

            if (usersWithSamePlayerId.length > 0) {
                await Admin.updateMany(
                    { playerId },
                    { $set: { playerId: null } }
                );
                console.log(
                    `Removed playerId from ${usersWithSamePlayerId.length} users`
                );
            }

            admin.playerId = playerId;
            await admin.save();

            res.status(200).json({
                userId: req.user.id,
                message: "playerId updated successfully",
            });
        } catch (e) {
            sendErrorResponse(res, 500, e);
        }
    },
};
