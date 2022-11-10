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
import process from 'process';

const cached_token_exists = fs.existsSync('initial_token.json');
let isPolling = false;
const getToken = async () => {
    const data = fs.readFileSync('initial_token.json', 'utf8');
    const parsedData: authenticationResponse = JSON.parse(data);
    //safer to refresh token then use cached version so we refresh the cached one
    const new_token = await refreshAccessToken(parsedData.refresh_token);
    return new_token;
};

const stopPolling = () => {
    isPolling = false;
};

const startPolling = async (token: string) => {
    isPolling = true;
    const poll_current_track_timer = setInterval(async () => {
        try {
            const track_data = await getCurrentlyPlaying(token);
            console.log('emitted track_data: ', track_data?.currentlyPlaying.name);
            server.emit('track_info', track_data);
        } catch (error) {
            console.log('error getting current track: ', error);
        }
    }, 5000); //refreshes every 5s
    return () => clearInterval(poll_current_track_timer);
};

io.on('connection', (socket) => {
    const connectionCount: number = io.engine.clientsCount;
    console.log('NEW CLIENT CONNECTION:', { id: socket.id, index: connectionCount });

    socket.on('disconnect', (reason) => {
        const connectionCount: number = io.engine.clientsCount - 1;
        console.log('remaining clients: ', connectionCount);

        if (connectionCount < 1) {
            console.log('NO MORE CLIENTS');

            isPolling = false;
        }
    });

    if (!isPolling) {
        if (!cached_token_exists) {
            console.log('NEED TO AUTHORISE APP FOR ACCOUNT');
        }

        if (cached_token_exists) {
            getToken().then((token) => startPolling(token)); //initiates the polling with existing token

            const refresh_token_timer = setInterval(() => {
                //grabs a new token  after timer elapses
                getToken().then((token) => startPolling(token));
            }, 359999); //refreshes every hour
            () => clearInterval(refresh_token_timer);
        }
    }
});

server.listen(3000, () => {
    console.log('SOCKET INITIATION SERVER LISTENING ON PORT 3000');
});
