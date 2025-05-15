const router = require("express").Router();

const {
    getAllLeads,
    addNewLeads,
    deleteLeads,
    getSingleLeads,
    updateLeads,
    updateLeadComments,
    getLeadComments,
    leadUserAssigin,
    updateLeadStatus,
} = require("../../controller/Leads/leadsController");
const checkPermission = require("../../middleware/checkPermission");

router.use(checkPermission());

router.get("/all", getAllLeads);
router.get("/single/:id", getSingleLeads);
router.post("/add", addNewLeads);
router.patch("/update/:id", updateLeads);
router.delete("/delete/:id", deleteLeads);
router.get("/comments/all/:id", getLeadComments);
router.post("/comments/add", updateLeadComments);
router.patch("/assign/update/:id", leadUserAssigin);
router.patch("/update/status/:id", updateLeadStatus);

module.exports = router;
