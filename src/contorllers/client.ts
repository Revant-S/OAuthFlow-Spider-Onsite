import { Request, Response } from "express";
import Client from "../models/client";
import crypto from 'crypto';

async function registerClient(redirectUrl: string, appName: string) {
    try {
        const client_id = crypto.randomBytes(16).toString('hex');
        const client_secret = crypto.randomBytes(32).toString('hex');
        const newClient = new Client({
            redirect_url: redirectUrl,
            app_name: appName,
            client_id,
            client_secret
        });
        await newClient.save();
        return {
            client_id, client_secret
        }
    } catch (error) {
        console.error('Error registering client:', error);
        throw error

    }
}

export const registerApp = async (req: Request, res: Response) => {
    const { redirect_url, app_name } = req.body;

    if (!redirect_url || !app_name) {
        return res.status(400).json({ message: 'Redirect URL and application name are required.' });
    }

    try {

        const existingClient = await Client.findOne({
            $or: [
                { redirect_url: redirect_url },
                { app_name: app_name }
            ]
        });

        if (existingClient) {
            return res.status(409).json({ message: 'Client with the same redirect URL or application name already exists.' });
        }
        const { client_id, client_secret } = await registerClient(redirect_url, app_name);
        return res.status(201).json({ message: 'Client registered successfully.', client_id, client_secret });
    } catch (error) {
        console.error('Error registering client:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
