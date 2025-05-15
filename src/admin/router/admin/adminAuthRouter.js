const router = require("express").Router();
const multer = require("multer");
const path = require("path");

const {
    addNewAdmin,
    adminLogin,
    deleteAdmin,
    getAllAdmins,
    getAdmin,
    updateAdminDetails,
    updateAdminPassword,
    getSingleAdmin,
    updateSingleAdmin,
    addQtnAdminsFromCsv,
    getAllAdminsList,
    refreshAdminToken,
    updatePlayerId,
    sessionAdminToken,
} = require("../../controller/admin/adminController");
const checkPermission = require("../../middleware/checkPermission");

router.post("/login", adminLogin);
router.post("/refreshToken", refreshAdminToken);
router.get("/session/:accessToken", sessionAdminToken);

router.get("/my-account", checkPermission(true), getAdmin);
router.get("/list", getAllAdminsList);
router.get("/all", getAllAdmins);

router.use(checkPermission());

router.post("/add", addNewAdmin);
router.patch("/update", updateAdminDetails);
router.patch("/update/password", updateAdminPassword);
router.patch("/update/single/:id", updateSingleAdmin);

router.get("/single/:id", getSingleAdmin);
router.delete("/delete/:id", deleteAdmin);
router.patch("/update", updatePlayerId);

module.exports = router;
