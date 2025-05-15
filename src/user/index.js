const { userAuthRouter, serviceRouter, pushNotificationRouter } = require("./router");
const { supportRouter, supportMessageRouter } = require("./router/support");

const router = require("express").Router();

router.use("/auth", userAuthRouter);
router.use("/services", serviceRouter);
router.use("/supports", supportRouter);
router.use("/supports/message", supportMessageRouter);
router.use("/notification", pushNotificationRouter);



module.exports = router;
