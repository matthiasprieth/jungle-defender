var serverPort = 8002,
    clients = {},
    bombs = [],
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
	
	/*below line -->ajax long polling
		by default nodejs determines the best transport based on browser
		capabilities, f.e. WebSockets*/
	
	//sio.set('transports', ['xhr-polling']);
});

sio.sockets.on('connection', function (socket) {

    newClient(socket);

    socket.on('clientMessage', onClientMessage);
    socket.on('bombMessage', function(data){
	onBombMessage(data);
	console.log("bombMessage");
	socket.broadcast.emit("newBomb",data);
	});
    socket.on('removeBomb', onRemoveBomb);
		socket.on('sendPos', function(data){
	onClientPos(data);
	socket.broadcast.emit('updatePosToAll', data);
});
    socket.on("updateBomb",function(data){
	console.log(data);
	onBombUpdate(data);
	socket.broadcast.emit('updateBombPos', data);
});
    socket.on('disconnect', onDisconnect);
});
function onBombUpdate(data){
  for(var i=0;i<bombs.length;i++){
    if(bombs[i].id==data.id){
			bombs[i].x=data.pos.x;
			bombs[i].y=data.pos.y;		
		}
  }
}
function onClientPos(data){
	clients[data.uid].data.x = data.pos.x;
	clients[data.uid].data.y = data.pos.y;
}

function onRemoveBomb(id){
    for(var i=0;i<bombs.length;i++){
        if(bombs[i].id==id){
            bombs.splice(i,1);
            break;
        }
    }
}

function onClientMessage(data) {
    clients[data.uid].data.action = data.action;
    sio.sockets.emit('clientMessage', data);
    //console.log(' client \t - '.blue + data.uid + 'sends data', data);
}
function onBombMessage(data){
    bombs.push(data);
    //console.log(bombs);
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

    //console.log("CLIENT_UID: ".black + clientUID);
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

    socket.emit('getAllBombs', bombs);

    socket.broadcast.emit('clientConnect', {
        'uid': clientUID,
        'x': posX,
        'y': posY
    });

    //console.log(' client\t - '.green + clientUID + ' connected');
};
