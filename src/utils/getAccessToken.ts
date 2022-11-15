import axios, { AxiosResponse } from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

export interface authenticationResponse {
    access_token: string;
    token_type: 'Bearer';
    scope: string;
    expires_in: number;
    refresh_token: string;
}

if (!client_id || !client_secret) throw new Error('missing env vars');

const getAccessToken = async (code: string, redirect_uri: string) => {
    const options = {
        method: `POST`,
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            Authorization: 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
            'content-type': 'application/x-www-form-urlencoded',
        },
        data: {
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code',
        },
    };

    try {
        //TODO handle unhappy path
        const response: AxiosResponse<authenticationResponse> = await axios(options);

        return response.data;
    } catch (error) {
        console.log('error getting access token: ', error);
    }
};

export default getAccessToken;
