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
    /*socket.on('disconnect', onDisconnect);*/
});

function onClientMessage(data) {
    console.log(data);
    clients[data.uid].data = data;
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
    console.log("CLIENT_UID: " + clientUID);
    clients[clientUID] = {
        'data': {
            'x': 0,
            'uid': clientUID
        }
    };

    socket.emit('connected', {
        'uid': clientUID,
        'clients': clients
    });

    socket.broadcast.emit('clientConnect', {
        'uid': clientUID
    });

    console.log(' client\t - '.green + clientUID + ' connected');
};