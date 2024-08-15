import { NextFunction, Request, Response } from "express";
import Client from "../models/client";
import jwt from "jsonwebtoken";
import AuthorizationCode from "../models/authorizationCodes";
import Token from "../models/authTokenModel";
import User from "../models/userModel";

const AUTH_CODE_EXPIRATION_MS = 10 * 60 * 1000;

interface UserRequest extends Request {
    user: any;
}

export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
    const { userEmail, password } = req.body;
    try {
     
        
        const user = await User.findOne({ userEmail });
      
        
        if (!user) throw new Error("User Not found");
        if (user.password !== password) throw new Error("Incorrect Password");
        (req as UserRequest).user = user;
        return next();
    } catch (error: any) {
        console.log(error.message);
        
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

export const authorize = async (req: Request, res: Response) => {
    const { client_id, redirect_uri, response_type, scope, state } = req.query;
    const client = await Client.findOne({ client_id });        // ******Just To simulate other wise it should be redirect***********

    if (!client) {
        return res.status(400).json({ message: 'Invalid client' });
    }
    // For Authorization Code Flow
    if (response_type === 'code') {
        const expiresAt = new Date(Date.now() + AUTH_CODE_EXPIRATION_MS);
        const code = jwt.sign({ client_id, redirect_uri }, 'secret', { expiresIn: '10m' });
        try {
            await AuthorizationCode.create({
                code,
                client_id,
                redirect_uri: redirect_uri as string,
                scope: scope as string,
                expires_at: expiresAt
            });
            return res.redirect(`${redirect_uri}?code=${code}&state=${state}`);
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    }
    // For Implicit Flow
    if (response_type === 'token') {
        console.log("Hello");
        
        const token = jwt.sign({ client_id, scope }, 'secret', { expiresIn: '1h' });
        // ******Just To simulate other wise it should be redirect***********
        return res.send(`${redirect_uri}#access_token=${token}&token_type=Bearer&state=${state}`);
    }
    return res.status(400).json({ message: 'Unsupported response type' });
};

export const getAuthToken = async (req: Request, res: Response) => {
    const { grant_type, code, redirect_uri, client_id, client_secret } = req.body;
    console.log(redirect_uri);
    
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

            const token = jwt.sign({ client_id }, 'secret', { expiresIn: '1h' });
            await Token.create({ token, client_id });

            return res.json({ access_token: token, token_type: 'Bearer', expires_in: 3600 });
        } catch (error: any) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    if (grant_type === 'client_credentials') {
        try {
            const client = await Client.findOne({ client_id, client_secret });
            if (!client) {
                return res.status(400).json({ message: 'Invalid client credentials' });
            }

            const token = jwt.sign({ client_id }, 'secret', { expiresIn: '1h' });
            await Token.create({ token, client_id });

            return res.json({ access_token: token, token_type: 'Bearer', expires_in: 3600 });
        } catch (error: any) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    return res.status(400).json({ message: 'Unsupported grant type' });
};