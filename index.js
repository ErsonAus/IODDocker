import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import path from 'path'

// These two lines replace __dirname which doesn't exist in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const server = http.createServer(app)
const io = new Server(server)

let totalUsers = 0;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    socket.on('new user', () => {
        totalUsers = io.engine.clientsCount;
        socket.emit('new user', { nickname: null, text: 'hello and welcome to this chat!', totalUsers: totalUsers })
    })

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
        io.emit('not typing', '')
    });

    socket.on('choose name', (name) => {
        totalUsers = io.engine.clientsCount;
        socket.broadcast.emit('new user', { nickname: name, text: 'has joined the chat', totalUsers: totalUsers })
        socket.id = name;
    });

    socket.on('typing', (name) => {
        socket.broadcast.emit('user typing', name)
        socket.emit('not typing', '')
    })

    socket.on('disconnect', () => {
        totalUsers--;
        socket.broadcast.emit('disconnected', { nickname: socket.id, text: 'has left the chat', totalUsers: totalUsers })
    })
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});