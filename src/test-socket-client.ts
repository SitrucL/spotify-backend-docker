import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');
// socket.connect();
socket.on('connect', () => {
    console.log('CONNECTED TO THE SOCKET SERVER');
});
