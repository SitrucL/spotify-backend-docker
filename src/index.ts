import fs from 'fs';
import express from 'express';
import process from 'process';
import http from 'http';
import { authenticationResponse } from './utils/getAccessToken';
import { Server } from 'socket.io';
import { getCurrentlyPlaying, refreshAccessToken } from './utils';
import getUserAuthorisation from './utils/getUserAuthorisation';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        // allowedHeaders: ['sogeking'],
        // credentials: true,
    },
});

let isPolling = false;
let poll_current_track_timer: NodeJS.Timer;
let refresh_token_timer: NodeJS.Timer;

let previous_track_name: string | undefined;
let current_track_name: string | undefined;

const port = process.env.PORT || 8080;
const cached_token_exists = fs.existsSync('initial_token.json');

/** Uses cached token to refresh Access token */
const getToken = async () => {
    const data = fs.readFileSync('initial_token.json', 'utf8');
    const parsedData: authenticationResponse = JSON.parse(data);
    //safer to refresh token then use cached version so we refresh the cached one
    const new_token = await refreshAccessToken(parsedData.refresh_token);
    return new_token;
};

const stopPolling = () => {
    isPolling = false;
    clearInterval(poll_current_track_timer);
};

const stopRefreshingToken = () => {
    clearInterval(refresh_token_timer);
};

/** Makes a request to spotify every 15 secs to get the currenlty playing track. The track data is emitted to all clients if the current track is different from the previous one */
const startPolling = async (token: string) => {
    isPolling = true;
    poll_current_track_timer = setInterval(async () => {
        try {
            const track_data = await getCurrentlyPlaying(token);
            current_track_name = track_data?.currentlyPlaying.name;
            if (current_track_name !== previous_track_name) {
                if (current_track_name === undefined || current_track_name.length < 1) {
                    io.emit('no_track_data');
                } else {
                    io.emit('track_data', track_data);
                }
                previous_track_name = current_track_name;
            }
        } catch (error) {
            console.log('error getting current track: ', error);
        }
    }, 15000); //refreshes every 15s
};

const main = () => {
    io.on('connection', async (socket) => {
        const connectionCount: number = io.engine.clientsCount;
        console.log('NEW CLIENT CONNECTION:', { id: socket.id, index: connectionCount });
        console.log('connectionCount: ', connectionCount);

        socket.on('disconnect', (reason) => {
            console.log('reason: ', reason);
            const connectionCount: number = io.engine.clientsCount;
            console.log('disconnect connectionCount: ', connectionCount);

            if (connectionCount < 1) {
                console.log('---------');
                stopPolling();
                stopRefreshingToken();
                previous_track_name = undefined;
                current_track_name = undefined;
            }
        });

        if (!isPolling) {
            if (!cached_token_exists) {
                console.log('NEED TO AUTHORISE APP FOR ACCOUNT');
                // start authorisation server
                // getUserAuthorisation();
            }

            if (cached_token_exists) {
                const token = await getToken();
                void startPolling(token); //initiates the polling with existing token

                refresh_token_timer = setInterval(async () => {
                    stopPolling();
                    console.log(`starting refresh_token_timer @ ${new Date().toISOString()}`);
                    //grabs a new token  after timer elapses
                    const token = await getToken();
                    void startPolling(token);
                }, 359999); //refreshes every hour
            }
        }
    });

    server.listen(port, () => {
        console.log(`SOCKET INITIATION SERVER LISTENING ON PORT ${port}`);
    });
};
main();
