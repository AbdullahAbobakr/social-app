import {EventEmitter} from "node:events"
import Mail from "nodemailer/lib/mailer"
import { sendEmail } from './../email/send.email';
import {verifyemail} from "../email/verify.email"
export const emailevent = new EventEmitter()

// email.event.ts
emailevent.on("confirmEmail" , async(data:Mail.Options & {otp:number})=>{
  try {
    data.subject = "confirm email";
    data.html = verifyemail({ otp: data.otp, title: "Email Verification" })
    await sendEmail(data)
  } catch (error) {
    console.log("fail to send email", error)
  }
})
