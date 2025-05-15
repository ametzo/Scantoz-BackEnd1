const router = require("express").Router();

const {
    getAllCustomers,
    addnewCustomers,
    deleteCustomers,
    getSingleCustomers,
    updateCustomers,
    getCustomerList,
    updateEmployee,
    addNewEmployee,
    deleteEmployee,
    updateCustomerStatus,
    downloadCompanyDetails,
} = require("../../controller/Customer/customerController");
const checkPermission = require("../../middleware/checkPermission");

router.get("/pdf-download/:id", downloadCompanyDetails);

router.use(checkPermission());

router.get("/all", getAllCustomers);
router.get("/single/:id", getSingleCustomers);
router.post("/add", addnewCustomers);
router.patch("/update/:id", updateCustomers);
router.delete("/delete/:id", deleteCustomers);
router.get("/list", getCustomerList);
router.post("/employee/add", addNewEmployee);
router.patch("/employee/update/:id", updateEmployee);
router.delete("/employee/delete/:id", deleteEmployee);
router.patch("/update/status/:id", updateCustomerStatus);

module.exports = router;
