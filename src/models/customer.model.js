const { Schema, model } = require("mongoose");

const stateSchema = new Schema(
    {
        company: {
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
        city: {
            type: String,
            // required: true,
        },
        // userStatus: {
        //     type: String,
        //     // required: true,
        // },
        assigned: {
            type: Schema.Types.ObjectId,
            ref: "Admin",
            required: true,
        },
        siteSupervisorName: {
            type: String,
        },
        siteSupervisorMobileNumber: {
            type: String,
        },
        siteSupervisorEmail: {
            type: String,
        },
        accountsName: {
            type: String,
        },
        accountsMobileNumber: {
            type: String,
        },
        accountsEmail: {
            type: String,
        },
        accountsName2: {
            type: String,
        },
        accountsMobileNumber2: {
            type: String,
        },
        accountsEmail2: {
            type: String,
        },
        vatCertificate: {
            type: [String],
            default: [],
        },
        tradeLicense: {
            type: [String],
            default: [],
        },
        contract: {
            type: [String],
            default: [],
        },
        lto: {
            type: [String],
            default: [],
        },
        isDeleted: {
            type: Boolean,
            required: true,
            default: false,
        },
        isActive: {
            type: Boolean,
            required: true,
            default: true,
        },
        isSupplierDetails: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    { timestamps: true }
);

const Customer = model("Customer", stateSchema);

module.exports = Customer;
