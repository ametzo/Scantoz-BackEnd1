const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const {
    userLogin,
    getUser,
    createForgetPassword,
    completeForgetPassword,
    changePassword,
    updateSupplierDetails,
} = require("../../controller/user/userController");
const userAuth = require("../../middleware/userAuth");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/images/user");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
            null,
            file.fieldname +
                "-" +
                uniqueSuffix +
                "." +
                file.originalname.split(".").pop()
        );
    },
});

const upload = multer({
    limits: {
        fileSize: 15000000,
    },
    fileFilter: (req, file, cb) => {
        const allowed = [".jpg", ".jpeg", ".heic", ".png", ".webp", ".pdf"];
        const ext = path.extname(file.originalname).toLowerCase();
        if (!allowed.includes(ext)) {
            return cb(
                new Error(
                    "Please upload jpg, jpeg, webp, heic, pdf, or png files."
                )
            );
        }
        cb(null, true);
    },
    storage: storage,
});

const handleUploadErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError || err instanceof Error) {
        return res.status(400).json({ error: err.message });
    }
    next();
};

router.post("/login", userLogin);
router.post("/forgot-password/create", createForgetPassword);
router.post("/forgot-password/complete", completeForgetPassword);

// router.use(userAuth);

router.get("/my-account", getUser);
router.post("/change/password", changePassword);
router.patch(
    "/update/supplier",
    upload.fields([
        { name: "vatCertificate", maxCount: 3 },
        { name: "tradeLicense", maxCount: 3 },
        { name: "contract", maxCount: 3 },
        { name: "lto", maxCount: 1 },
    ]),
    handleUploadErrors,
    updateSupplierDetails
);

module.exports = router;
