import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const mystery_token = process.env.TOKEN;

if (!client_id || !client_secret || !mystery_token) throw new Error('missing env vars');

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
        const response = await axios(options);
        const { access_token } = response.data;
        console.log('access_token: ', access_token);

        return access_token;
    } catch (error) {
        console.log('error: ', error);
    }
};
refreshAccessToken(mystery_token);

export default refreshAccessToken;
