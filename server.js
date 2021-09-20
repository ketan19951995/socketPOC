const http = require('http')
const express = require('express')
const app = express()
const server = http.createServer(http);
const socketio = require('socket.io')
const io = socketio(server)
const path = require('path')
app.use(express.static(path.join(__dirname, '../public')))

let count = 0; 

io.on('connection', () => {
    console.log('connected')

    // Send Event
    socket.emit('updatecount', count) 

    // Listening the event and performing logic here 
    socket.on('increment', () => {
        count++;
        io.emit('updatecount', count)
    })
    
    // when a client disconnect this function is called 
    socket.on('disconnect', () => {
        console.log('server disconnected')
    })
})

server.listen(3000, () => {
    console.log('server started')
})