var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    socket.on('join', function(name){
        io.emit('joining', name + ' has joined.');
    });
    socket.on('chat message', function(data){
        socket.broadcast.emit('chat message', data.name + ': ' + data.msg);
    });
    socket.on('on typing', function(data){
        socket.broadcast.emit('on typing', data.name);
    });
    socket.on('off typing', function(data){
        socket.broadcast.emit('off typing');
    });
    socket.on('disconnect', function(){
        io.emit('leaving', 'Someone has left.');
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});
