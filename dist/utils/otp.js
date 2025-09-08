"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNmuberOtp = void 0;
const generateNmuberOtp = () => {
    return Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
};
exports.generateNmuberOtp = generateNmuberOtp;
