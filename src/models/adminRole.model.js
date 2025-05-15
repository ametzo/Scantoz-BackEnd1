const { Schema, model } = require("mongoose");

const adminRoleSchema = new Schema(
    {
        roleName: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            // required: true,
        },
        roles: {
            type: [
                {
                    stepNumber: {
                        type: Number,
                        required: true,
                    },
                    permissions: [],
                },
            ],
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
    { timestamps: true, strict: false }
);

adminRoleSchema.virtual("adminsCount", {
    ref: "Admin",
    localField: "_id",
    foreignField: "roles",
    count: true,
});

const AdminRole = model("AdminRole", adminRoleSchema);

module.exports = AdminRole;
