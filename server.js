var serverPort = 8002,
    colors = require('colors'),
    express = require('express'),
    verbose = false,
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    sio = require('socket.io').listen(server),

    team = 1,

    ROUNDTIME = 180, // Konstante: Rundenzeit z.B. 300 Sekunden (5 Minuten)
    timeLeft = ROUNDTIME;

    randomStartXPosition = [15, 24, 30, 47, 47, 33, 1, 1],
    randomStartYPosition = [15, 24, 30, 30, 7, 7, 30, 2],
    startPositionPos = 0;

setInterval(function(){
    if (timeLeft <= 0) {
        timeLeft = ROUNDTIME;
        sio.sockets.emit('roundEnd', {
            'winnerTeam': 1,
            'kills': 20,
            'timeLeft': timeLeft
        });

        Bombs.clean();
        for (var i in Client.clients) {
            if (startPositionPos >= randomStartXPosition.length || startPositionPos >= randomStartXPosition.length){
                startPositionPos = 0;
            } 
            var posX = parseInt(randomStartXPosition[startPositionPos] * 32);
            var posY = parseInt(randomStartYPosition[startPositionPos] * 32);
            Client.clients[i].data.x = posX;
            Client.clients[i].data.y = posY;
            sio.sockets.emit('updatePosToAll', {
                uid:  Client.clients[i].data.uid,
                pos:  {x: posX, y: posY}
            });    
            startPositionPos++;
        }    
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
                Bombs.bombs[i].x = parseInt(data.pos.x);
                Bombs.bombs[i].y = parseInt(data.pos.y);
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
        
        Bombs.bombs.push(data);
        Bombs.counter++;
        console.log("All Bombs\n==================");
        console.log(Bombs.bombs);
        console.log("======================");
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

    newClient: function (socket) {
        var clientUID = socket.id;

        if (startPositionPos >= randomStartXPosition.length || startPositionPos >= randomStartXPosition.length){
            startPositionPos = 0;
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
            Client.clients[data.uid].data.x = parseInt(data.pos.x);
            Client.clients[data.uid].data.y = parseInt(data.pos.y);
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
        data.server_id=Bombs.counter;
        Bombs.onCreate(data);
        socket.emit("setBombServerID", {
           uid: data.uid,
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
        //if(!data.server_id==0){
           Bombs.onUpdate(data);
            socket.broadcast.emit('updateBombPos', data);
        //}else{
             //console.log("wrong server id");
        //}
        
    });
    socket.on('disconnect', Client.onDisconnect);
});
