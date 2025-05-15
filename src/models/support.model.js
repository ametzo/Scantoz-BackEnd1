const { Schema, model } = require("mongoose");

const SupportSchema = new Schema(
    {
        adminId: {
            type: Schema.Types.ObjectId,
            ref: "Admin",
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },
        subject: {
            type: String,
            required: true,
        },
        messages: [
            {
                message: { type: String, required: true },
                image: { type: String },
                date: { type: Date, required: true },
                sender: {
                    type: String,
                    enum: ["admin", "user"],
                    required: true,
                },
            },
        ],
        status: {
            type: String,
            required: true,
        },
        isDeleted: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    { timestamps: true }
);

const Support = model("Support", SupportSchema);

module.exports = Support;
