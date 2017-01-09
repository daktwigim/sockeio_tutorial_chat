var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

var list = [];
io.on('connection', function(socket){
    io.emit('refresh', list);
    socket.on('join', function(name){
        list.push({ "id": socket.id, "name": name });
        io.emit('joining', { "list": list, "msg": name + ' has joined.' });
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
        var target, leaver;
        list.forEach(function(item, index){
            if ( item.id === socket.id ) {
                target = index;
                leaver = item.name;
            }
        });
        list.splice(target, 1);
        io.emit('leaving', { "list": list, "msg": leaver + ' has left.' });
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});
