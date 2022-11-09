import util from 'util';
import fs from 'fs';
import express from 'express';
const app = express();
import http from 'http';
const server = http.createServer(app);
import { authenticationResponse } from './getAccessToken';
import { Server } from 'socket.io';
const io = new Server(server);
import getCurrentlyPlaying from './getCurrentlyPlaying';
import getUserAuthorisation from './getUserAuthorisation';
import refreshAccessToken from './refreshAccessToken';
import { exit } from 'process';

const cached_token_exists = fs.existsSync('initial_token.json');

const getToken = async () => {
    const data = fs.readFileSync('initial_token.json', 'utf8');
    const parsedData: authenticationResponse = JSON.parse(data);
    //safer to refresh token then use cached version so we refresh the cached one
    const new_token = await refreshAccessToken(parsedData.refresh_token);
    return new_token;
};

const startPolling = async (token: string) => {
    const poll_current_track_timer = setInterval(async () => {
        try {
            const track = await getCurrentlyPlaying(token);

            console.log('emitted: ', {
                track: track?.currentlyPlaying.name,
                timestamp: new Date().toLocaleString(),
            });
            // TODO: get current track and emit info as socket event
        } catch (error) {
            console.log('error getting current track: ', error);
        }
    }, 5000); //refreshes every 5s
    return () => clearInterval(poll_current_track_timer);
};

io.on('connection', (socket) => {
    //TODO: if not already polling spotify - trigger authentication or token refresh
    //TODO: begin polling spotify
    //TODO: emit info over websockets
});

io.on('disconnect', () => {
    // TODO: check if all clients have been disconnected and stop polling if true
});

server.listen(3000, () => {
    console.log('SOCKET INITIATION SERVER LISTENING ON PORT 3000');
});

if (!cached_token_exists) {
    console.log('NEED TO AUTHORISE APP FOR ACCOUNT');
    exit();
}

if (cached_token_exists) {
    getToken().then((token) => startPolling(token)); //initiates the polling with existing token

    const refresh_token_timer = setInterval(() => {
        //grabs a new token  after timer elapses
        getToken().then((token) => startPolling(token));
    }, 359999); //refreshes every hour
    () => clearInterval(refresh_token_timer);
}
