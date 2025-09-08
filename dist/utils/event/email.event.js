"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailevent = void 0;
const node_events_1 = require("node:events");
const send_email_1 = require("./../email/send.email");
const verify_email_1 = require("../email/verify.email");
exports.emailevent = new node_events_1.EventEmitter();
exports.emailevent.on("confirmEmail", async (data) => {
    try {
        data.subject = "confirm email";
        data.html = (0, verify_email_1.verifyemail)({ otp: data.otp, title: "Email Verification" });
        await (0, send_email_1.sendEmail)(data);
    }
    catch (error) {
        console.log("fail to send email", error);
    }
});
