var serverPort = 8002,
    colors = require('colors'),
    express = require('express'),
    verbose = false,
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    sio = require('socket.io').listen(server),

    team = 1,

    ROUNDTIME = 20, // Konstante: Rundenzeit 300 Sekunden (5 Minuten)
    timeLeft = ROUNDTIME;

setInterval(function(){
    if (timeLeft <= 0) {
        timeLeft = ROUNDTIME;
        Bombs.clean();

        sio.sockets.emit('roundEnd', {
            'winnerTeam': 1,
            'kills': 20,
            'timeLeft': timeLeft
        });
    }else{
        timeLeft--;
    }
}, 1000);

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


var Bombs = {
    bombs: [],
    counter: 1,
    onUpdate: function (data) {
        for (var i = 0; i < Bombs.bombs.length; i++) {
            if (Bombs.bombs[i].server_id == data.server_id) {
                Bombs.bombs[i].x = data.pos.x;
                Bombs.bombs[i].y = data.pos.y;
            }
        }

    },
    onRemove: function (server_id) {
        for (var i = 0; i < Bombs.bombs.length; i++) {
            if (Bombs.bombs[i].server_id == server_id) {
                Bombs.bombs.splice(i, 1);
                break;
            }
        }
    },
    onCreate: function (data) {
        data.server_id= Bombs.counter;
        Bombs.counter++;
        Bombs.bombs.push(data);

        console.log("All Bombs\n==================");
        console.log(Bombs.bombs);
        console.log("======================");
        return data;
    },
    all: function () {
        return Bombs.bombs;
    },
    clean: function () {
        Bombs.bombs = [];
    }
};
function isEmpty(ob){
	for(var i in ob){ return false;}
	return true;
}

var Client = {
    clients: {},
    randomStartXPosition: [15, 16, 17],
    randomStartYPosition: [15, 16, 17],
    startPositionPos: 0,

    newClient: function (socket) {
        var clientUID = socket.id;


        if (startPosition >= randomStartXPosition.length || startPosition >= randomStartXPosition.length){
            startPostion = 0;
        } 
        var posX = parseInt(randomStartXPosition[startPositionPos] * 32);
        var posY = parseInt(randomStartYPosition[startPositionPos] * 32);
        startPositionPos++;

        //console.log("CLIENT_UID: ".black + clientUID);
        Client.clients[clientUID] = {
            'data': {
                'x': posX,
                'y': posY,
                'uid': clientUID,
                'action': '',
                'team': team
            }
        };

        socket.emit('connected', {
            'uid': clientUID,
            'clients': Client.clients,
            'timeLeft': timeLeft
        });

        socket.emit('getAllBombs', Bombs.all());

        socket.broadcast.emit('clientConnect', {
            'uid': clientUID,
            'x': posX,
            'y': posY,
            'team': team
        });

        //console.log(' client\t - '.green + clientUID + ' connected');

        if (team == 1) {
            team = 2;
        } else {
            team = 1;
        }
    },
    onPos: function (data) {
        if(Client.clients[data.uid]){
            Client.clients[data.uid].data.x = data.pos.x;
            Client.clients[data.uid].data.y = data.pos.y;
        }

    },
    onMessage: function (data) {
        if(Client.clients[data.uid]){
            Client.clients[data.uid].data.action = data.action;
            sio.sockets.emit('clientMessage', data);
            //console.log(' client \t - '.blue + data.uid + 'sends data', data);
        }
    },
    onDisconnect: function () {
        var uid = this.id;
        sio.sockets.emit('clientDisconnect', {uid: uid});
        delete Client.clients[uid];
				if (isEmpty(Client.clients)) {
            Bombs.clean();
        }
        console.log(' client\t - '.red + uid + ' disconnected');
    },
    clean: function () {
        Client.clients = [];
    }
};

sio.sockets.on('connection', function (socket) {

    Client.newClient(socket);

    socket.on('clientMessage', Client.onMessage);
    socket.on('createBomb', function (data) {
        data = Bombs.onCreate(data);
        socket.emit("setBombServerID", {
           id: data.id,
           server_id: data.server_id
        });
        socket.broadcast.emit("newBomb", data);
    });
    socket.on('removeBomb',function(server_id){
        console.log("removeBomb");
        Bombs.onRemove(server_id);
        socket.broadcast.emit("removeBombFromEnemy", server_id);
    });
    socket.on('sendPos', function (data) {
        Client.onPos(data);
        socket.broadcast.emit('updatePosToAll', data);
    });
    socket.on("updateBomb", function (data) {
        Bombs.onUpdate(data);
        socket.broadcast.emit('updateBombPos', data);
    });
    socket.on('disconnect', Client.onDisconnect);
});
