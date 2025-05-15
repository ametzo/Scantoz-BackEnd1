const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
// const compression = require("compression");
const adminRouter = require("./src/admin");
const userRouter = require("./src/user");
// Create an instance of an Express app
const app = express();

// app.use(compression());
app.use(express.json({ limit: "50mb" }));

const corsOptions = {
    origin: (origin, callback) => {
        callback(null, true); // Allow all origins
        // const allowedOrigins = [
        //     process.env.FRONTEND_URL,
        //     "http://localhost:4200",
        //     "https://your-frontend-domain.com",
        // ];

        // if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        //     callback(null, true);
        // } else {
        //     callback(new Error("CORS policy: Origin not allowed"), false);
        // }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());

app.use("/public", express.static("public"));
app.use(express.static(path.join(__dirname, '../public')));


app.get("/api/v1", (req, res) => {
    try {
        res.status(200).json({ message: "Success", data: "your data here" });
    } catch (err) {
        res.status(500).json({
            message: "Internal Server Error",
            error: err.message,
        });
    }
});

app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/user", userRouter);
//
module.exports = { app };
