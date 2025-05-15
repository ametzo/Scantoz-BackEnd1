const router = require("express").Router();

const {
    createNewAdminRole,
    updateAdminRole,
    deleteAdminRole,
    getAllRoles,
    getSingleAdminRole,
    getAllRoleNames,
    getSingleAdminRoleAdminList,
    getUserRoles,
    getSingleUserRoles,
} = require("../../controller/adminRoles/adminRolesController");
const checkPermission = require("../../middleware/checkPermission");

router.use(checkPermission());

router.post("/create", createNewAdminRole);
router.patch("/update/:id", updateAdminRole);
router.delete("/delete/:id", deleteAdminRole);
router.get("/all", getAllRoles);
router.get("/single/:id", getSingleAdminRole);
router.get("/single/:id", getSingleAdminRole);
router.get("/all/role-names", getAllRoleNames);
router.get("/admins/list/:roleId", getSingleAdminRoleAdminList);
router.get("/user-roles", getUserRoles);
router.get("/user-roles/:id", getSingleUserRoles);

module.exports = router;
