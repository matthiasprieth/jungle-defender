var serverPort = 8002,
    clients = {},
    colors = require('colors'),
    express = require('express'),
    verbose = false,
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    sio = require('socket.io').listen(server);


/* ------  ------  ------ Express ------  ------  ------ */

server.listen(serverPort);
console.log('\t :: Express :: Listening on port ' + serverPort);

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

app.get('/*', function (req, res, next) {
    var file = req.params[0];
    if (verbose) console.log('\t :: Express :: file requested : ' + file);
    res.sendfile(__dirname + '/' + file);
});
sio.configure(function () {
    sio.set('log level', 0);
    sio.set('authorization', function (handshakeData, callback) {
        callback(null, true); // error first callback style
    });
});

sio.sockets.on('connection', function (socket) {

    newClient(socket);

    socket.on('clientMessage', onClientMessage);
    socket.on('disconnect', onDisconnect);
});

function onClientMessage(data) {
    console.log(data);
    clients[data.uid].data.action = data.action;
    console.log(clients[data.uid].data);
    sio.sockets.emit('clientMessage', data);
    console.log(' client \t - '.blue + data.uid + 'sends data', data);
}

function onDisconnect() {
    var uid = this.id;
    sio.sockets.emit('clientDisconnect', {uid: uid});
    delete clients[uid];
    console.log(' client\t - '.red + uid + ' disconnected');
}
function newClient(socket) {
    var clientUID = socket.id;
    var posX=parseInt(15*32);
    var posY=parseInt(15*32);

    console.log("CLIENT_UID: ".black + clientUID);
    clients[clientUID] = {
        'data': {
            'x': posX,
            'y': posY,
            'uid': clientUID,
            'action': ''
        }
    };

    socket.emit('connected', {
        'uid': clientUID,
        'clients': clients
    });

    socket.broadcast.emit('clientConnect', {
        'uid': clientUID,
        'x': posX,
        'y': posY
    });

    console.log(' client\t - '.green + clientUID + ' connected');
};