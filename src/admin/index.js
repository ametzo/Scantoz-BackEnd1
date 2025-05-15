const router = require("express").Router();

const { adminAuthRouter } = require("./router/admin");
const { adminRolesRouter } = require("./router/adminRoles");
const { adminContactUsRouter } = require("./router/contactUs");
const { adminCustomerRouter } = require("./router/customer");
const { adminLeadsRouter } = require("./router/leads");
const { adminReportRouter } = require("./router/repots");
const { adminServiceRouter } = require("./router/service");
const {
    adminSupportRouter,
    adminSupportMessageRouter,
} = require("./router/support");
const { adminWorkerRouter } = require("./router/worker");

router.use("/auth", adminAuthRouter);
router.use("/roles", adminRolesRouter);
router.use("/leads", adminLeadsRouter);
router.use("/customers", adminCustomerRouter);
router.use("/workers", adminWorkerRouter);
router.use("/services", adminServiceRouter);
router.use("/supports", adminSupportRouter);
router.use("/supports/message", adminSupportMessageRouter);
router.use("/reports", adminReportRouter);
router.use("/contact-us", adminContactUsRouter);



;
module.exports = router;
