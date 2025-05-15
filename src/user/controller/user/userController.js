const { isValidObjectId } = require("mongoose");
const sendErrorResponse = require("../../../helper/sendErrorResponse");
const {
    Lead,
    LeadComment,
    CustomerEmployee,
    Customer,
    Admin,
} = require("../../../models");
const { userLoginSchema } = require("../validations/userAuth.schema");
const { hash, compare } = require("bcryptjs");
const sendForgetPasswordEmail = require("../../helper/emails/sendForgetPasswordEmail");
const crypto = require("crypto");
const { generateOtp } = require("../../../helper/otpGenerator");
const supplierSchema = require("../validations/supplier.schema");
const OTP_EXPIRATION_TIME = 5 * 60 * 1000;
// const OTP_EXPIRATION_TIME = 3 * 1000;
const jwt = require("jsonwebtoken");

module.exports = {
    userLogin: async (req, res) => {
        try {
            const { userName, password } = req.body;

            const { error } = userLoginSchema.validate(req.body);
            if (error) {
                return sendErrorResponse(
                    res,
                    400,
                    error.details ? error?.details[0]?.message : error.message
                );
            }

            let user = await CustomerEmployee.findOne({
                $or: [{ userName: userName }, { email: userName }],
                isLoggin: true,
                isDeleted: false,
            })
                .populate(
                    "customerId",
                    "company phone email city isSupplierDetails"
                )
                .select("name designation phone email password");

            console.log(user, "user");
            if (user) {
                const isMatch = await compare(password, user.password);
                if (!isMatch) {
                    return sendErrorResponse(
                        res,
                        400,
                        "Invalid Password credentials for user"
                    );
                }

                const jwtToken = await user.generateAuthToken();
                await user.save();

                return res.status(200).json({
                    isUser: true,
                    status: user.status,
                    user: user,
                    jwtToken,
                });
            }

            let admin = await Admin.findOne({ userId: userName });

            if (admin) {
                const isMatch = await compare(password, admin.password);
                if (!isMatch) {
                    return sendErrorResponse(
                        res,
                        400,
                        "Invalid Password credentials for admin"
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
                    httpOnly: true,
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                    sameSite: "Strict",
                });

                return res.status(200).json({
                    isUser: false,
                    admin: {
                        _id: admin._id,
                        name: admin.name,
                        userId: admin.userId,
                        email: admin.email,
                        phoneNumber: admin.phoneNumber,
                    },
                    jwtToken,
                    redirectionalUrl: `${process.env.FRONTEND_URL}/session/${jwtToken}`,
                });
            }

            return sendErrorResponse(
                res,
                400,
                "Account not found. Invalid credentials"
            );
        } catch (err) {
            console.log(err);
            sendErrorResponse(res, 500, err.message || "Internal Server Error");
        }
    },

    getUser: async (req, res) => {
        try {
            res.status(200).json(req.user);
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },
    createForgetPassword: async (req, res) => {
        try {
            const { email } = req.body;

            if (!email) {
                return sendErrorResponse(res, 400, "Invalid credentials");
            }

            const user = await CustomerEmployee.findOne({
                email,
                isDeleted: false,
            });

            if (!user) {
                return sendErrorResponse(res, 400, "Invalid credentials");
            }

            // const otp = await generateOtp();
            const otp = 12345;
            const otpExpires = Date.now() + OTP_EXPIRATION_TIME;

            await sendForgetPasswordEmail({
                name: user.name,
                otp,
                email: user.email,
                subject: `Forgot Password Otp `,
            });

            user.otp = otp;
            user.otpExpires = otpExpires;
            await user.save();

            res.status(200).json({
                userId: user._id,
                message: "forget password email sent successfully",
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },
    completeForgetPassword: async (req, res) => {
        try {
            const { otp, password, confirmPassword, userId } = req.body;

            if (!otp) {
                return sendErrorResponse(res, 400, "please enter otp");
            }

            if (!isValidObjectId(userId)) {
                return sendErrorResponse(res, 400, "invalid userId");
            }

            if (password !== confirmPassword) {
                return sendErrorResponse(
                    res,
                    400,
                    "please enter correct confirm pawword "
                );
            }

            const user = await CustomerEmployee.findOne({
                _id: userId,
                otp: otp,
                isDeleted: false,
            });

            if (!user || user.otp !== otp) {
                return sendErrorResponse(
                    res,
                    400,
                    "Incorrect OTP, please try again"
                );
            }

            if (Date.now() > user.otpExpires) {
                user.otp = null;
                user.otpExpires = null;
                await user.save();

                return sendErrorResponse(
                    res,
                    400,
                    "OTP has expired, please request a new one"
                );
            }

            const hashedPassword = await hash(password, 8);

            user.password = hashedPassword;
            user.otp = null;
            user.otpExpires = null;
            await user.save();

            res.status(200).json({
                userId: user._id,
                message: "Password has been updated  successfully",
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },
    changePassword: async (req, res) => {
        try {
            const { password, confirmPassword } = req.body;

            if (password !== confirmPassword) {
                return sendErrorResponse(
                    res,
                    400,
                    "please enter correct confirm pawword "
                );
            }

            const user = await CustomerEmployee.findOne({
                _id: req.user.id,

                isDeleted: false,
            });

            if (!user) {
                return sendErrorResponse(res, 400, "user does not exist");
            }

            const hashedPassword = await hash(password, 8);

            user.password = hashedPassword;
            user.otp = null;
            user.otpExpires = null;
            await user.save();

            res.status(200).json({
                userId: user._id,
                message: "Password has been updated  successfully",
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    updateSupplierDetails: async (req, res) => {
        try {
            const { error } = supplierSchema.validate(req.body, {
                stripUnknown: true,
            });

            if (error) {
                return sendErrorResponse(res, 400, error.details[0].message);
            }

            const customer = await Customer.findById(req?.user?.customerId?.id);

            if (!customer) {
                return sendErrorResponse(res, 400, "Customer does not exist");
            }

            if (customer?.isSupplierDetails) {
                return sendErrorResponse(
                    res,
                    400,
                    "Customer supplier details already added"
                );
            }

            console.log("call reached her2");

            if (
                // !req.files?.["vatCertificate"]?.length ||
                !req.files?.["tradeLicense"]?.length ||
                !req.files?.["contract"]?.length
            ) {
                return sendErrorResponse(
                    res,
                    400,
                    "Please upload all the fields."
                );
            }

            const vatCertificatePhotos = req.files["vatCertificate"]
                ? req.files["vatCertificate"].map(
                      (file) => "/" + file?.path.replace(/\\/g, "/")
                  )
                : [];

            const tradeLicensePhotos = req.files["tradeLicense"]
                ? req.files["tradeLicense"].map(
                      (file) => "/" + file?.path.replace(/\\/g, "/")
                  )
                : [];

            const contractPhotos = req.files["contract"]
                ? req.files["contract"].map(
                      (file) => "/" + file?.path.replace(/\\/g, "/")
                  )
                : [];

            const ltoPhotos = req.files["lto"]
                ? req.files["lto"].map(
                      (file) => "/" + file?.path.replace(/\\/g, "/")
                  )
                : [];

            const customerUpdate = await Customer.findByIdAndUpdate(
                req?.user?.customerId?.id,
                {
                    ...req.body,
                    isSupplierDetails: true,
                    vatCertificate: vatCertificatePhotos,
                    tradeLicense: tradeLicensePhotos,
                    contract: contractPhotos,
                    lto: ltoPhotos,
                },
                { new: true }
            );

            if (!customerUpdate) {
                return sendErrorResponse(
                    res,
                    400,
                    "Failed to update customer details"
                );
            }

            res.status(200).json({
                userId: req?.user?._id,
                customerId: customerUpdate._id,
                message: "Customer has been updated successfully",
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },
};
