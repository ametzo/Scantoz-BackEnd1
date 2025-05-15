const router = require("express").Router();

const {
    getAllWorkers,
    addnewWorkers,
    deleteWorkers,
    getSingleWorkers,
    updateWorkers,
    getWorkerList,
} = require("../../controller/Worker/workerController");
const checkPermission = require("../../middleware/checkPermission");

router.use(checkPermission());

router.get("/all", getAllWorkers);
router.get("/single/:id", getSingleWorkers);
router.post("/add", addnewWorkers);
router.patch("/update/:id", updateWorkers);
router.delete("/delete/:id", deleteWorkers);
router.get("/list", getWorkerList);

module.exports = router;
