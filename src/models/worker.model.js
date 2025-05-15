const { Schema, model } = require("mongoose");

const workerSchema = new Schema(
    {
        employeeName: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            // required: true,
        },
        phone: {
            type: String,
            // required: true,
            // default: "0", 
        },
        // jobTitle: {
        //     type: String,
        //     required: true,
        // },

        // email: {
        //     type: String,
        //     required: true,
        // },
        // location: {
        //     type: String,
        //     required: true,
        // },
        // joinDate: {
        //     type: Date,
        //     required: true,
        // },
        // expDate: {
        //     type: Date,
        //     required: true,
        // },
        // emergencyName: {
        //     type: String,
        //     required: true,
        // },
        // salary: {
        //     type: Number,
        //     required: true,
        //     default: 0, // Default value as 0 as mentioned
        // },
        // emergencyPhone: {
        //     type: String,
        //     required: true,
        //     default: "0", // Default value as '0' as mentioned
        // },
        // userId: {
        //     type: String,
        //     required: true,
        // },
        // password: {
        //     type: String,
        //     required: true,
        // },
        // bankAccount: {
        //     type: String,
        //     required: true,
        // },
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
    },
    { timestamps: true }
);

const Worker = model("Worker", workerSchema);

module.exports = Worker;
