const router = require("express").Router();

const {
    getAllSupports,
    addnewSupports,
    deleteSupports,
    getSingleSupports,
    updateSupports,
    getWorkerList,
    updateSupportStatus,
} = require("../../controller/Support/supportController");
const checkPermission = require("../../middleware/checkPermission");

router.use(checkPermission());

router.get("/all", getAllSupports);
router.get("/single/:id", getSingleSupports);
router.post("/add", addnewSupports);
// router.patch("/update/:id", updateSupports);
router.delete("/delete/:id", deleteSupports);
// router.get("/list", getWorkerList);
router.patch("/update/status/:id", updateSupportStatus);

module.exports = router;
