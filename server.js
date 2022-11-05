const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');

const users = {};

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get('/:room', (req, res) => {
  res.render('room', {roomId: req.params.room});
});

io.on('connection', socket => {

  socket.on('join-room', function(roomId, userId) {
    console.log(`User ${userId} joined room ${roomId}`);

    // socket has unique id, key it to userId
    users[socket.id] = userId;

    socket.join(roomId);

    // when someone else joins
    // to everyone in the room, including self
    io.in(roomId).emit('user-connected', userId, users);
  });

  socket.on('disconnecting', () => {
    socket.broadcast.emit('user-disconnected', users[socket.id]);
    delete users[socket.id];
  });

  socket.on('debugCommand', (roomId, data, timestamp) => {
    console.log(data, Math.round(+new Date()));
    io.in(roomId).emit('debug-command', data, timestamp, Math.round(+new Date()) - timestamp);
  });
});

server.listen(3000);
console.log('server running');