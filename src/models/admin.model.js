const { Schema, model } = require("mongoose");
const jwt = require("jsonwebtoken");

const adminSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        userId: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            lowercase: true,
            unique: true,
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        joinedDate: {
            type: Date,
        },
        password: {
            type: String,
            required: true,
        },
        // passwordDecrypt: {
        //     type: String,
        //     required: true,
        // },
        role: {
            type: Schema.Types.ObjectId,
            ref: "AdminRole",
            required: true,
        },
        lastLoggedIn: {
            type: Date,
        },
        jwtToken: {
            type: String,
        },
        refreshToken: {
            type: String,
        },
        adminRole: {
            type: String,
            required: true,
            enum: ["super-admin", "admin"],
        },
        status: {
            type: String,
            required: true,
            default: "active",
            enum: ["active", "in-active", "deleted"],
        },
        playerId: { type: String },
    },
    { timestamps: true }
);

adminSchema.methods.toJSON = function () {
    const admin = this;
    const adminObj = admin.toObject();

    delete adminObj.password;
    delete adminObj.jwtToken;

    return adminObj;
};

adminSchema.methods.generateAuthToken = async function () {
    try {
        const admin = this;
        const jwtToken = jwt.sign(
            { _id: admin._id.toString(), email: admin?.email?.toString() },
            process.env.JWT_SECRET,
            {
                expiresIn: "10m",
            }
        );

        admin.jwtToken = jwtToken;
        return jwtToken;
    } catch (err) {
        throw new Error(err);
    }
};

const Admin = model("Admin", adminSchema);

module.exports = Admin;
