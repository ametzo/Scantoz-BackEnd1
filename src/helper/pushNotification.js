const axios = require("axios");

const sendPushNotificationByEmail = async ({
    playerIds,
    title,
    message,
    data,
}) => {
    try {
        if (!playerIds && playerIds.length < 1) {
            return console.error("User not found or player ID not available");
        }

        console.log(playerIds);

        const notification = {
            app_id: process.env.ONE_SIGNAL_APP_ID,
            include_external_user_ids: [...playerIds],
            headings: { en: title },
            contents: { en: message },
            data: { ...data },
        };

        const response = await axios.post(
            "https://onesignal.com/api/v1/notifications",
            notification,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${process.env.ONE_SIGNAL_API_KEY}`,
                },
            }
        );

        console.log("Notification sent:", response.data);
    } catch (error) {
        console.log("Error sending notification:", error.response || error);

        console.error("Error sending notification:", error.response || error);
    }
};

module.exports = { sendPushNotificationByEmail };
