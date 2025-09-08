import { createTransport , Transporter} from "nodemailer"
import SMTPTransport from "nodemailer/lib/smtp-transport"
import Mail from "nodemailer/lib/mailer"



export const sendEmail= async (data:Mail.Options):Promise<void>=>{
const transporter: Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options
> = createTransport({
    service: "gmail",
    auth: {
        user:process.env.EMAIL as string,
        pass: process.env.EMAIL_PASSWORD,
    },
});

(async () => {
    try {
        const info = await transporter.sendMail({
        from: `"send email" <${process.env.EMAIL as string}>`,
        ...data,
    });
    console.log("Message sent:", info.messageId);
    } catch (error) {
        console.error("❌ Error sending email:", error);

    }
    
})();
}