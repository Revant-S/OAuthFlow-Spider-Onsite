import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import Client from "../models/client";
import AuthorizationCode from "../models/authorizationCodes";
import Token from "../models/authTokenModel";
import User from "../models/userModel";

const AUTH_CODE_EXPIRATION_MS = 10 * 60 * 1000;
const JWT_SECRET = 'secret'; 

interface UserRequest extends Request {
    user?: any;
}


export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
    const { userEmail, password } = req.body;
    try {
        if (!userEmail || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ userEmail });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

       
        if (user.password !== password) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        (req as UserRequest).user = user;
        return next();
    } catch (error) {
        console.error("Error verifying user:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


export const authorize = async (req: Request, res: Response) => {
    const { client_id, redirect_uri, response_type, scope, state } = req.query;
    const client = await Client.findOne({ client_id });
    const user = (req as UserRequest).user;

    if (!client) {
        return res.status(400).json({ message: 'Invalid client' });
    }

    if (response_type === 'code') {
        if (!user || !redirect_uri) {
            return res.status(400).json({ message: 'Missing user or redirect URI' });
        }

        const expiresAt = new Date(Date.now() + AUTH_CODE_EXPIRATION_MS);
        const code = jwt.sign({ user: user._id, redirect_uri }, JWT_SECRET, { expiresIn: '10m' });

        try {
            await AuthorizationCode.create({
                code,
                client_id,
                redirect_uri: redirect_uri as string,
                scope: scope as string,
                expires_at: expiresAt
            });

            return res.json({ url: `${redirect_uri}?code=${code}&state=${state}`, code });
        } catch (error) {
            console.error("Error creating authorization code:", error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    if (response_type === 'token') {
        if (!user || !redirect_uri) {
            return res.status(401).json({ message: 'User not authenticated or missing redirect URI' });
        }

        const token = jwt.sign({ user: user._id, scope }, JWT_SECRET, { expiresIn: '1h' });

        return res.json({ url: `${redirect_uri}#access_token=${token}&token_type=Bearer&state=${state}`, token });
    }

    return res.status(400).json({ message: 'Unsupported response type' });
};


export const getAuthToken = async (req: Request, res: Response) => {
    const { grant_type, code, client_id, client_secret } = req.body;

    if (grant_type === 'authorization_code') {
        try {
            const authorizationCode = await AuthorizationCode.findOne({ code });
            if (!authorizationCode) {
                return res.status(400).json({ message: 'Invalid authorization code' });
            }

            if (authorizationCode.expires_at < new Date()) {
                return res.status(400).json({ message: 'Authorization code expired' });
            }

            const client = await Client.findOne({ client_id, client_secret });
            if (!client) {
                return res.status(400).json({ message: 'Invalid client credentials' });
            }

            const decoded: any = jwt.verify(code, JWT_SECRET);
            const token = jwt.sign({ user: decoded.user }, JWT_SECRET, { expiresIn: '1h' });
            const expiresAt = new Date(Date.now() + 3600 * 1000);

            await Token.create({ token, expires_at: expiresAt, client_id });

            return res.json({ access_token: token, token_type: 'Bearer', expires_in: 3600 });
        } catch (error) {
            console.error("Error getting auth token:", error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    if (grant_type === 'client_credentials') {
        try {
            const client = await Client.findOne({ client_id, client_secret });
            if (!client) {
                return res.status(400).json({ message: 'Invalid client credentials' });
            }

            const token = jwt.sign({ client_id }, JWT_SECRET, { expiresIn: '1h' });
            const expiresAt = new Date(Date.now() + 3600 * 1000);

            await Token.create({ token, client_id, expires_at: expiresAt });

            return res.json({ access_token: token, token_type: 'Bearer', expires_in: 3600 });
        } catch (error) {
            console.error("Error getting client credentials token:", error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    return res.status(400).json({ message: 'Unsupported grant type' });
};
