/**
 * Prieth Matthias, fhs33735
 * Rainer Michael, fhs33736
 */

const serverPort = 8002;
const colors = require('colors');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io'); // Importing Server from socket.io

const verbose = false;
const app = express();
const server = http.createServer(app);
const io = new Server(server); // Attach socket.io to the server

const points = {
    team1: 0,
    team2: 0,
};
let team = 1;

const ROUNDTIME = 180; // Round time in seconds
let timeLeft = ROUNDTIME;

const randomStartXPosition = [15, 24, 30, 47, 47, 33, 1, 1];
const randomStartYPosition = [15, 24, 30, 30, 7, 7, 30, 2];
let startPositionPos = 0;

// Timer logic for rounds
setInterval(() => {
    if (timeLeft <= 0) {
        timeLeft = ROUNDTIME;
        io.sockets.emit('roundEnd', {
            team1: points.team1,
            team2: points.team2,
            timeLeft: timeLeft,
        });
        points.team1 = 0;
        points.team2 = 0;

        Bombs.clean();
        for (const clientId in Client.clients) {
            if (startPositionPos >= randomStartXPosition.length) {
                startPositionPos = 0;
            }
            const posX = parseInt(randomStartXPosition[startPositionPos] * 32);
            const posY = parseInt(randomStartYPosition[startPositionPos] * 32);
            Client.clients[clientId].data.x = posX;
            Client.clients[clientId].data.y = posY;
            io.sockets.emit('updatePosToAll', {
                uid: Client.clients[clientId].data.uid,
                pos: { x: posX, y: posY },
            });
            startPositionPos++;
        }
    } else {
        timeLeft--;
    }
}, 1000);

// Express routes
server.listen(process.env.PORT || serverPort, () => {
    console.log('\t :: Express :: Listening on port ' + (process.env.PORT || serverPort));
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/*', (req, res, next) => {
    const file = req.params[0];
    if (verbose) console.log('\t :: Express :: file requested : ' + file);
    res.sendFile(__dirname + '/' + file);
});

// Bombs handling
const Bombs = {
    bombs: [],
    counter: 1,
    onUpdate(data) {
        for (let bomb of this.bombs) {
            if (bomb.server_id === data.server_id) {
                bomb.x = parseInt(data.pos.x);
                bomb.y = parseInt(data.pos.y);
            }
        }
    },
    onRemove(server_id) {
        this.bombs = this.bombs.filter((bomb) => bomb.server_id !== server_id);
    },
    onCreate(data) {
        this.bombs.push(data);
        this.counter++;
    },
    all() {
        return this.bombs;
    },
    clean() {
        this.bombs = [];
    },
};

// Client handling
const Client = {
    clients: {},
    newClient(socket) {
        const clientUID = socket.id;
        console.log('New client connected: ' + clientUID);

        if (startPositionPos >= randomStartXPosition.length) {
            startPositionPos = 0;
        }
        const posX = parseInt(randomStartXPosition[startPositionPos] * 32);
        const posY = parseInt(randomStartYPosition[startPositionPos] * 32);
        startPositionPos++;

        this.clients[clientUID] = {
            data: {
                x: posX,
                y: posY,
                uid: clientUID,
                action: '',
                team: team,
            },
        };

        socket.emit('connected', {
            uid: clientUID,
            clients: this.clients,
            timeLeft: timeLeft,
        });

        socket.emit('getAllBombs', Bombs.all());

        socket.broadcast.emit('clientConnect', {
            uid: clientUID,
            x: posX,
            y: posY,
            team: team,
        });

        team = team === 1 ? 2 : 1;
    },
    onPos(data) {
        if (!data || !data.uid || !this.clients || !this.clients[data.uid]) {
            return; // Exit early if data is null or doesn't have the expected structure
        }
        
        if (this.clients[data.uid]) {
            this.clients[data.uid].data.x = parseInt(data.pos.x);
            this.clients[data.uid].data.y = parseInt(data.pos.y);
        }
    },
    onMessage(data) {
        if (!data || !data.uid || !this.clients || !this.clients[data.uid]) {
            return; // Exit early if data is null or doesn't have the expected structure
        }

        if (this.clients[data.uid]) {
            this.clients[data.uid].data.action = data.action;
            io.sockets.emit('clientMessage', data);
        }
    },
    onDisconnect(socket) {
        const uid = socket.id;
        delete this.clients[uid];
        if (Object.keys(this.clients).length === 0) {
            Bombs.clean();
        }
        io.sockets.emit('clientDisconnect', { uid: uid });
    },
};

// Socket.io connection handlers
io.on('connection', (socket) => {
    Client.newClient(socket);

    socket.on('clientMessage', Client.onMessage);
    socket.on('createBomb', (data) => {
        data.server_id = Bombs.counter;
        Bombs.onCreate(data);
        socket.emit('setBombServerID', {
            uid: data.uid,
            id: data.id,
            server_id: data.server_id,
        });
        socket.broadcast.emit('newBomb', data);
    });

    socket.on('playerCollided', (data) => {
        if (data.team === 1) points.team2++;
        else if (data.team === 2) points.team1++;
        Bombs.onRemove(data.server_id);
        socket.broadcast.emit('EnemyCollidedWithBomb', {
            server_id: data.server_id,
            team: data.team,
        });
    });

    socket.on('sendPos', (data) => {
        Client.onPos(data);
        socket.broadcast.emit('updatePosToAll', data);
    });

    socket.on('updateBomb', (data) => {
        Bombs.onUpdate(data);
        socket.broadcast.emit('updateBombPos', data);
    });

    socket.on('disconnect', () => {
        Client.onDisconnect(socket);
    });
});
