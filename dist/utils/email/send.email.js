"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = require("nodemailer");
const sendEmail = async (data) => {
    const transporter = (0, nodemailer_1.createTransport)({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
    (async () => {
        try {
            const info = await transporter.sendMail({
                from: `"send email" <${process.env.EMAIL}>`,
                ...data,
            });
            console.log("Message sent:", info.messageId);
        }
        catch (error) {
            console.error("❌ Error sending email:", error);
        }
    })();
};
exports.sendEmail = sendEmail;
