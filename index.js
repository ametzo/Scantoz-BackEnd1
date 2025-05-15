require("dotenv").config();
const PORT = process.env.PORT || 8189;
const { app } = require("./app");
const { connectMonogdb } = require("./src/config/dbConfig");

const start = async () => {
    try {
        await connectMonogdb();
    } catch (err) {
        console.log(err);
    }

    app.listen(PORT, () => {
        console.log(`running ${PORT} server....`);
        console.log(`server is up and running on port ${PORT}`);
    });
};

start();
