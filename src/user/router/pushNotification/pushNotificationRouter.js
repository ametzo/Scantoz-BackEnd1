const router = require("express").Router();

const {
    updatePlayerId,
    testPushNotification,
} = require("../../controller/pushNotification/pushNotificationController");
const userAuth = require("../../middleware/userAuth");

router.post("/test", testPushNotification);
router.use(userAuth);
router.patch("/update", updatePlayerId);

module.exports = router;
