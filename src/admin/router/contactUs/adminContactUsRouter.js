const router = require("express").Router();

const {
    addNewContactUs,
} = require("../../controller/contactUs/contactUsController");

router.post("/add", addNewContactUs);

module.exports = router;
