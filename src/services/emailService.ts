import nodemailer from "nodemailer"
import debug from "debug"
const mailDebugger = debug("app:mailDebugger")



export const sendEmail = async (email: string, text: string) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "revant.sinha@gmail.com",
            pass: process.env.appPassword
        }
    })

    const mailOptions = {
        from: "Verify.com",
        to: email,
        subject: "Email Verification",
        text

    }
    try {
        await transporter.sendMail(mailOptions);
        mailDebugger("Email is Sent")
    } catch (error: any) {
        mailDebugger("Email Couldnt be sent");
    }
}


