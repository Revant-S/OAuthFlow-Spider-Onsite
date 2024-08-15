import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModel";

const JWT_SECRET = 'secret';

export const getUserInfo = async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(400).json({ message: 'Bearer token is required' });
    }
    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { user: string, scope: string };
        const user = await User.findById(decoded.user);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        return res.json({
            userEmail: user.userEmail,
            bank_secret: user.bank_secret,

        });
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
