const nodemailer = require("nodemailer");

const sendEmailHelper = async ({ email, subject, text }) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.MAILER_HOST,
            port: 587,
            secure: false, // upgrade later with STARTTLS
            auth: {
                user: process.env.MAILER_EMAIL,
                pass: process.env.MAILER_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: `${subject}`,
            html: text,
        });

        console.log("email has been sent");
    } catch (error) {
        console.log(error);
        console.log("E-mail not sent");
    }
};

module.exports = sendEmailHelper;
