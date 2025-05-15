const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const jwt = require("jsonwebtoken");

const stateSchema = new Schema(
    {
        customerId: {
            type: Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        designation: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        isLoggin: {
            type: Boolean,
            required: true,
            default: false,
        },
        userName: {
            type: String,
            required: function () {
                return this.isLoggin === true;
            },
        },
        password: {
            type: String,
            required: function () {
                return this.isLoggin === true;
            },
        },
        isDeleted: {
            type: Boolean,
            required: true,
            default: false,
        },
        status: {
            type: String,
            // required: true,
            lowercase: true,
            enum: ["pending", "ok", "cancelled", "disabled"],
        },
        jwtToken: {
            type: String,
        },
        otp: {
            type: Number,
        },
        otpExpires: {
            type: String,
        },
        playerId: {
            type: String,
        },
    },
    { timestamps: true }
);

stateSchema.methods.toJSON = function () {
    const employee = this;
    const employeeObj = employee.toObject();

    delete employeeObj.password;
    delete employeeObj.jwtToken;

    return employeeObj;
};

stateSchema.methods.generateAuthToken = async function () {
    try {
        const employee = this;
        const jwtToken = jwt.sign(
            {
                _id: employee._id.toString(),
                userName: employee?.userName?.toString(),
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        employee.jwtToken = jwtToken;
        return jwtToken;
    } catch (err) {
        throw new Error(err);
    }
};

const CustomerEmployee = model("CustomerEmployee", stateSchema);

module.exports = CustomerEmployee;
