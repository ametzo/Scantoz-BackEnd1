const router = require("express").Router();

const {
    getAllServices,
    downloadGeneratedService,
} = require("../../controller/reports/adminReportController");
const checkPermission = require("../../middleware/checkPermission");

router.use(checkPermission());

router.get("/all", getAllServices);
router.get("/pdf-download", downloadGeneratedService);

module.exports = router;
