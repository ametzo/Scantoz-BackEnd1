const {
    sendPushNotificationByEmail,
} = require("../../../helper/pushNotification");
const sendErrorResponse = require("../../../helper/sendErrorResponse");
const { CustomerEmployee } = require("../../../models");

module.exports = {
    updatePlayerId: async (req, res) => {
        try {
            const { playerId } = req.body;

            if (!playerId) {
                return sendErrorResponse(res, 400, "Invalid Player Id ");
            }

            const usersWithSamePlayerId = await CustomerEmployee.find({
                playerId,
            });

            console.log(req.user._id, req.user.id);

            const user = await CustomerEmployee.findOne({ _id: req.user.id });

            if (!user) {
                return sendErrorResponse(res, 400, "Invalid user");
            }

            if (usersWithSamePlayerId.length > 0) {
                await CustomerEmployee.updateMany(
                    { playerId },
                    { $set: { playerId: null } }
                );
                console.log(
                    `Removed playerId from ${usersWithSamePlayerId.length} users`
                );
            }

            console.log(playerId, "playerID");

            user.playerId = playerId;
            await user.save();

            res.status(200).json({
                userId: req.user.id,
                message: "playerId updated successfully",
            });
        } catch (e) {
            sendErrorResponse(res, 500, e);
        }
    },

    testPushNotification: async (req, res) => {
        try {
            const { playerIds, message, title, data } = req.body;

            await sendPushNotificationByEmail({
                playerIds,
                title,
                message,
                data,
            });

            res.status(200).json({
                message: "notification sended to subscribed",
            });
        } catch (e) {
            sendErrorResponse(res, 500, e);
        }
    },
};
