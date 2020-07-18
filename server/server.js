var express = require('express');
var path = require('path');
var http = require('http');
var socketIO = require('socket.io');



var app = express();
var server = http.createServer(app);
var io = socketIO(server);
io.listen(3001)

const port = process.env.PORT || 5000;

console.log("STARTING SERVER...")
server.listen(port, () => console.log(`Listening on port ${port}`));

io.on("connection", (socket) => {
    console.log("New client connected");
    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});
