var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

var list = [];
io.on('connection', function(socket){
    console.log(Date()+':'+socket.id+' has connected');
    io.emit('refresh', list);
    socket.on('join', function(name){
        list.push({ "id": socket.id, "name": name });
        io.emit('joining', { "list": list, "msg": name + ' has joined.' });
        console.log(Date()+':'+name+'('+socket.id+') has joined to the channel');
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

    socket.on('change nick', function(name){
        var target, changer;
        list.forEach(function(item, index){
            if ( item.id === socket.id ) {
                target = index;
                changer = item.name;
                item.name = name;
                io.emit('changing nick', { "list": list, "msg": changer + ' has changed his name to ' + name });
            }
        });
    });

    socket.on('disconnect', function(){
        var target, leaver;
        list.forEach(function(item, index){
            if ( item.id === socket.id ) {
                target = index;
                leaver = item.name;
                list.splice(target, 1);
                io.emit('leaving', { "list": list, "msg": leaver + ' has left.' });
            }
        });
        console.log(Date()+':'+socket.id+' has disconnected');
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});
