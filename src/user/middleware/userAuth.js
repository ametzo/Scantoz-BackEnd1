const jwt = require("jsonwebtoken");
const sendErrorResponse = require("../../helper/sendErrorResponse");
const { CustomerEmployee } = require("../../models");

const userAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return sendErrorResponse(res, 401, "token not found");
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET);

        const user = await CustomerEmployee.findOne({
            _id: decode._id,
            jwtToken: token,
        })
            .populate(
                "customerId",
                "company phone email city assigned siteSupervisorName siteSupervisorMobileNumber siteSupervisorEmail accountsName accountsMobileNumber accountsEmail accountsName2 accountsMobileNumber2 accountsEmail2 vatCertificate tradeLicense contract isSupplierDetails"
            )
            .select("_id name  designation  phone email ");

        // .cache();

        if (!user) {
            return sendErrorResponse(res, 401, "invalid token");
        }

        req.user = user;
        next();
    } catch (err) {
        console.log(err);
        sendErrorResponse(res, 401, err);
    }
};

module.exports = userAuth;
