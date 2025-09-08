"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const email_event_1 = require("./../../utils/event/email.event");
const user_model_1 = require("../../DB/models/user.model");
const user_repository_1 = require("../../DB/user.repository");
const hash_security_1 = require("../../utils/security/hash.security");
const otp_1 = require("../../utils/otp");
const error_response_1 = require("../../utils/response/error.response");
const token_security_1 = require("../../utils/security/token.security");
class authenticationServices {
    userModel = new user_repository_1.userRepository(user_model_1.UserModel);
    constructor() { }
    signup = async (req, res) => {
        const { username, email, password } = req.body;
        const otp = (0, otp_1.generateNmuberOtp)();
        const user = (await this.userModel.createuser({
            data: [{
                    username, email, password: await (0, hash_security_1.generateHash)(password),
                    confirmEmailotp: await (0, hash_security_1.generateHash)(String(otp))
                }],
        })) || [];
        email_event_1.emailevent.emit("confirmEmail", { to: email, otp });
        return res.status(201).json({ message: "done", data: { user } });
    };
    confirmEmail = async (req, res) => {
        const { email, otp } = req.body;
        const user = await this.userModel.findone({
            filter: {
                email,
                confirmEmailotp: { $exists: true },
                confirmAt: { $exists: false }
            }
        });
        if (!user) {
            throw new error_response_1.NotfoundException("invalid account");
        }
        if (!(await (0, hash_security_1.compareHash)(String(otp), user.confirmEmailotp))) {
            throw new error_response_1.NotfoundException("invalid code otp");
        }
        await this.userModel.updateone({
            filter: { email },
            update: {
                confirmAt: new Date(),
                unset: { confirmEmailotp: "", }
            },
        });
        return res.json({ message: "done", data: req.body });
    };
    login = async (req, res) => {
        const { email, password } = req.body;
        const user = await this.userModel.findone({
            filter: { email },
        });
        if (!user) {
            throw new error_response_1.NotfoundException("invalid account");
        }
        if (!user.confirmAt) {
            throw new error_response_1.NotfoundException("please confirm your email");
        }
        if (!(await (0, hash_security_1.compareHash)(password, user.password))) {
            throw new error_response_1.NotfoundException("invalid account");
        }
        const credentials = await (0, token_security_1.createlogincredentials)(user);
        return res.json({ message: "done", data: { credentials } });
    };
}
exports.default = new authenticationServices();
