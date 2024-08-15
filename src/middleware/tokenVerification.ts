import { NextFunction, Request, Response } from "express";
import AdminToken from "../models/adminToken";

export const verifyAdminToken = async (req: Request, res: Response, next: NextFunction) => {
    const { adminToken, userEmail } = req.body;
    if (!adminToken) return res.json("Admin Token is requried");
    const adminTokenInDb = await AdminToken.findOne({ userEmail });
    if (!adminTokenInDb) return res.json({ message: "Please Send Valid Admin Token" });
    if (adminTokenInDb.userEmail !== userEmail) return res.json({ message: "Please send a Valid Admin Token" });
    return next();
}