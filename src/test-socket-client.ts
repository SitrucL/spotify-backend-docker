import util from 'util';
import { io } from 'socket.io-client';

import readline from 'readline';
// const socket = io('https://personal-spotify-handler.fly.dev');
const socket = io('http://localhost:8080');

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

process.stdin.on('keypress', (str, key) => {
    if (key.name === 'd') {
        socket.close();
        process.exit();
    } else if (key.name === 'r') {
        socket.connect();
    } else {
        console.log(`You pressed the "${str}" key`);
        console.log();
        console.log(key);
        console.log();
    }
});

socket.on('connect', () => {
    console.log('CONNECTED TO THE SOCKET SERVER');
});

socket.on('track_data', (data) => {
    console.log('incoming track info: :\n ', util.inspect(data, { showHidden: false, depth: null, colors: true }));
});
