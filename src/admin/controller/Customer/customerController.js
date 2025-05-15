const { isValidObjectId } = require("mongoose");
const sendErrorResponse = require("../../../helper/sendErrorResponse");
const { Customer, CustomerEmployee } = require("../../../models");
const {
    addCustomerSchema,
    addCustomerEmployeeSchema,
    editCustomerEmployeeSchema,
} = require("../../validations/customer/addCustomer.schema");
const { hash, compare } = require("bcryptjs");
const {
    createCustomerPdf,
} = require("../../../helper/customer/customerHelper");

module.exports = {
    addnewCustomers: async (req, res) => {
        const { company, phone, email, city, userStatus, assigned } = req.body;

        const { error } = addCustomerSchema.validate(req.body);
        if (error) {
            return sendErrorResponse(res, 400, error.details[0].message);
        }

        const existingRecord = await Customer.findOne({
            email,
        });

        if (existingRecord) {
            return sendErrorResponse(res, 400, `Email is already in use.`);
        }

        try {
            const newCustomer = new Customer({
                company,
                phone,
                email,
                city,
                userStatus,
                assigned,
                isDeleted: false,
                isActive: true,
            });

            // Save the customer to the database first
            await newCustomer.save();

            return res.status(201).json({
                message: "Customer and employees created successfully.",
                customer: newCustomer,
            });
        } catch (err) {
            console.error(err);
            return sendErrorResponse(res, 500, "Internal server error");
        }
    },

    updateCustomers: async (req, res) => {
        try {
            const { id } = req.params;
            const { company, phone, email, city, assigned } = req.body;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "Invalid customer ID");
            }

            const { error } = addCustomerSchema.validate(req.body);
            if (error) {
                return sendErrorResponse(res, 400, error.details[0].message);
            }

            const customer = await Customer.findOne({ _id: id });
            if (!customer) {
                return sendErrorResponse(res, 404, "Customer not found");
            }

            const updatedCustomer = await Customer.findOneAndUpdate(
                { _id: id, isDeleted: false },
                { company, phone, email, city, assigned },
                { runValidators: true, new: true }
            );

            if (!updatedCustomer) {
                return sendErrorResponse(res, 404, "Customer update failed");
            }

            res.status(200).json({
                message: "Customer successfully updated",
                _id: id,
            });
        } catch (err) {
            sendErrorResponse(res, 500, "Internal server error");
        }
    },

    deleteCustomers: async (req, res) => {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "invalid Customers id");
            }

            const customer = await Customer.findOneAndUpdate(
                {
                    _id: id,
                    isDeleted: false,
                },
                { $set: { isDeleted: true } }
            );
            if (!customer) {
                return sendErrorResponse(res, 404, "Customers not found");
            }

            res.status(200).json({
                message: "customersuccessfully deleted",
                _id: id,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getAllCustomers: async (req, res) => {
        try {
            const {
                skip = 0,
                limit = 10,
                fromDate,
                toDate,
                searchQuery,
            } = req.query;

            const filters = { isDeleted: false };

            if (searchQuery && searchQuery !== "") {
                filters.$or = [
                    { company: { $regex: searchQuery, $options: "i" } },
                    { email: { $regex: searchQuery, $options: "i" } },
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

            const customers = await Customer.find(filters)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(limit * skip)
                .lean();

            const totalCustomers = await Customer.countDocuments(filters);

            res.status(200).json({
                customers,
                totalCustomers,
                skip: Number(skip),
                limit: Number(limit),
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getSingleCustomers: async (req, res) => {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "invalid Customers id");
            }

            const customer = await Customer.findOne({
                isDeleted: false,
                _id: id,
            });
            if (!customer) {
                return sendErrorResponse(res, 404, "Customers not found");
            }
            const customerEmplyee = await CustomerEmployee.find({
                customerId: id,
                isDeleted: false,
            });

            res.status(200).json({ customer, customerEmplyee });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getCustomerList: async (req, res) => {
        try {
            const customers = await Customer.find({
                isDeleted: false,
            }).select("company");

            res.status(200).json(customers);
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    addNewEmployee: async (req, res) => {
        try {
            const {
                customerId,
                name,
                designation,
                phone,
                email,
                isLoggin,
                userName,
                password,
            } = req.body;

            const { error } = addCustomerEmployeeSchema.validate(req.body);
            if (error) {
                return sendErrorResponse(res, 400, error.details[0].message);
            }

            const existingRecord = await CustomerEmployee.findOne({
                $or: [{ email }, { userName }],
            });

            if (existingRecord) {
                const conflictField =
                    existingRecord.email === email ? "Email" : "Username";
                return sendErrorResponse(
                    res,
                    400,
                    `${conflictField} is already in use.`
                );
            }

            let updatedFields = {
                customerId,
                name,
                designation,
                phone,
                email,
                isLoggin,
            };

            if (isLoggin) {
                const hashedPassword = await hash(password, 8);
                updatedFields.password = hashedPassword;
                updatedFields.userName = userName;
            }

            const newCustomer = new CustomerEmployee({
                ...updatedFields,
                isDeleted: false,
                isActive: true,
            });

            // Save the customer to the database first
            await newCustomer.save();

            return res.status(201).json({
                message: "Customer and employees created successfully.",
                customer: newCustomer,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    updateEmployee: async (req, res) => {
        try {
            const { id } = req.params;
            const {
                customerId,
                name,
                designation,
                phone,
                email,
                isLoggin,
                userName,
                password,
            } = req.body;

            const { error } = editCustomerEmployeeSchema.validate(req.body);
            if (error) {
                return sendErrorResponse(res, 400, error.details[0].message);
            }

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "Invalid customer ID");
            }

            const customerEmployee = await CustomerEmployee.findOne({
                _id: id,
            });
            if (!customerEmployee) {
                return sendErrorResponse(res, 404, "Customer not found");
            }

            let updatedFields = {
                customerId,
                name,
                designation,
                phone,
                email,
                isLoggin,
            };

            if (isLoggin) {
                if (password) {
                    const hashedPassword = await hash(password, 8);
                    updatedFields.password = hashedPassword;
                } else {
                    if (!customerEmployee?.password) {
                        return sendErrorResponse(
                            res,
                            404,
                            "Customer password is required "
                        );
                    }
                }

                updatedFields.userName = userName;
            }

            const updatedCustomer = await CustomerEmployee.findOneAndUpdate(
                { _id: id, isDeleted: false },
                {
                    ...updatedFields,
                    isDeleted: false,
                    isActive: true,
                },
                { runValidators: true, new: true }
            );

            if (!updatedCustomer) {
                return sendErrorResponse(res, 404, "Customer update failed");
            }

            res.status(200).json({
                message: "Customer successfully updated",
                _id: id,
                customer: updatedCustomer,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getCustomerEmployeeList: async (req, res) => {
        try {
            const customers = await CustomerEmployee.find({
                isDeleted: false,
            });

            res.status(200).json(customers);
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },
    deleteEmployee: async (req, res) => {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "invalid Customers id");
            }

            const customer = await CustomerEmployee.findOneAndUpdate(
                {
                    _id: id,
                    isDeleted: false,
                },
                { $set: { isDeleted: true } }
            );
            if (!customer) {
                return sendErrorResponse(res, 404, "Customers not found");
            }

            res.status(200).json({
                message: "customer successfully deleted",
                _id: id,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    updateCustomerStatus: async (req, res) => {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "invalid Supportsid");
            }
            const { status } = req.body;

            if (!status) {
                return sendErrorResponse(res, 400, " Customer status required");
            }

            const customer = await Customer.findOneAndUpdate(
                {
                    _id: id,
                    isDeleted: false,
                },
                { $set: { userStatus: status } }
            );

            if (!customer) {
                return sendErrorResponse(res, 404, "Customer not found");
            }

            res.status(200).json({
                message: "Customer successfully updated",
                _id: id,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },
    downloadCompanyDetails: async (req, res) => {
        try {
            const { id } = req.params;
            const customer = await Customer.findOne({ _id: id });

            if (!customer) {
                return sendErrorResponse(res, 404, "Customer not found");
            }

            const pdfBuffer = await createCustomerPdf({ customer });

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
        } catch (err) {
            console.error("Error generating PDF:", err);
            sendErrorResponse(res, 500, "Internal server error");
        }
    },
};
