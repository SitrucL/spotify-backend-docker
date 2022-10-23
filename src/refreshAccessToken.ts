import axios, { AxiosResponse } from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import { exit } from 'process';

interface refreshTokenResponse {
    access_token: string;
    token_type: 'Bearer';
    expires_in: number;
    scope: string;
}

dotenv.config();
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

if (!client_id || !client_secret) throw new Error('missing env vars');

const refreshAccessToken = async (refresh_token: string) => {
    const options = {
        method: `POST`,
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            Authorization: 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
            'content-type': 'application/x-www-form-urlencoded',
        },
        data: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token,
        },
    };

    try {
        const response: AxiosResponse<refreshTokenResponse> = await axios(options);
        const { access_token } = response.data;

        return access_token;
    } catch (error) {
        console.log('error refreshing token: ', error);
        exit();
    }
};

export default refreshAccessToken;
