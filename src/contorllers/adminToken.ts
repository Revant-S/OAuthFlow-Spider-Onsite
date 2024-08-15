import { Request, Response } from "express";
import AdminToken from "../models/adminToken";
import crypto from "crypto"
import { sendEmail } from "../services/emailService";
export const getAdminToken = async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
        const length = 10;
        const adminToken = crypto.randomBytes(length).toString('hex').slice(0, length);
        await sendEmail(email, `Your Admin Token is ${adminToken}. The Token is valid for 1 hour.`);

        const expiresAt = new Date(Date.now() + 3600 * 1000);
        await AdminToken.create({
            userEmail: email,
            adminToken,
            expiresAt
        })
        res.json({
            message: "Your Admin Token is sent to You Please check Your Email"
        })
    } catch (error: any) {
        console.log(error.message);

        res.json({ message: "Some Error" })
    }
}