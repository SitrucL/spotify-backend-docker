// https://developer.spotify.com/documentation/general/guides/authorization/code-flow/
import express from 'express';
import querystring from 'query-string';
import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import getAccessToken from './getAccessToken';

dotenv.config();
const client_id = process.env.SPOTIFY_CLIENT_ID;
const port = 8888;
export const base_url = `http://localhost:${port}`;
const redirect_uri = `${base_url}/callback`;
console.log('redirect_uri: ', redirect_uri);

const app = express();

const generateRandomString = (length: number) => {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

const original_state = generateRandomString(16);
const scope = 'user-read-currently-playing user-modify-playback-state user-read-playback-state';

const user_acceptance_url =
    'https://accounts.spotify.com/authorize?' +
    querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: original_state,
    });
app.get('/authorise_app', function (req, res) {
    console.log('user_acceptance_url: ', user_acceptance_url);

    res.redirect(user_acceptance_url);
});

app.get('/callback', async function (req, res) {
    const code = req.query.code || null;
    const state = req.query.state || null;

    if (state === null || state !== original_state) {
        res.redirect(
            '/#' +
                querystring.stringify({
                    error: 'state_mismatch',
                }),
        );
    } else {
        const initial_token = await getAccessToken(String(code), redirect_uri);
        fs.writeFileSync('./initial_token.json', JSON.stringify(initial_token));

        res.send({
            access_token: initial_token,
        });
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
    console.log(`${base_url}/authorise_app`);
});
