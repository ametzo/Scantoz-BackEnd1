const { Schema, model } = require("mongoose");

const stateSchema = new Schema(
    {
        date: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
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
        calledBy: {
            type: String,
            // required: true,
        },
        userStatus: {
            type: String,
            required: true,
        },
        assigned: {
            type: Schema.Types.ObjectId,
            ref: "Admin",
            // required: true,
        },
        description: {
            type: String,
            required: true,
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
    },
    { timestamps: true }
);

const Lead = model("Lead", stateSchema);

module.exports = Lead;
