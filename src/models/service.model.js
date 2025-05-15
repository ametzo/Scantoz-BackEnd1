const { Schema, model } = require("mongoose");

const serviceSchema = new Schema(
    {
        customerId: {
            type: Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },
        project: {
            type: String,
            required: true,
        },
        // serviceCount: {
        //     type: Number,
        //     required: true,
        //     default: 1, // Assuming a default value of 1 for service count
        // },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
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

const Service = model("Service", serviceSchema);

module.exports = Service;
