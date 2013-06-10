/**
 */
/**
 * Created with JetBrains PhpStorm.
 * User: Mitch
 * Date: 04.05.13
 * Time: 14:32
 * To change this template use File | Settings | File Templates.
 */
var toHHMMSS = function (sec) {
    var sec_num = parseInt(sec, 10); // don't forget the second parm
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    var time = minutes + ':' + seconds;
    return time;
};

define(['MainPlayers', 'Bombs'], function (Players, Bomb) {
    //game resources
    var initNetwork = function () {

        socket = io.connect('/');
        localUID = 0;
        var players = [];

        bombs = [];

        var Client = {
            onConnected: function (data) {
                localUID = data.uid;
                for (var prop in data.clients) {
                    if (data.clients.hasOwnProperty(prop)) {
                        createNewPlayer(data.clients[prop].data);
                    }
                }
//<<<<<<< HEAD
//=======
                me.game.HUD.removeItem("connectingStatus");

//>>>>>>> 49739830fac96c269013496d4df673b0bce8708d
                var timeLeft = data.timeLeft;
                me.game.HUD.setItemValue("timeLeft", toHHMMSS(timeLeft));
                setInterval(function () {
                    timeLeft--;
                    me.game.HUD.setItemValue("timeLeft", toHHMMSS(timeLeft));
                }, 1000);

                me.game.repaint();

                me.debug.renderHitBox = true;
            },

            onClientConnect: function (data) {
                createNewPlayer(data);
            },
            onClientDisconnect: function (data) {
                for (var i = 0; i < players.length; i++) {
                    if (players[i].uid === data.uid) {
                        me.game.remove(players[i]);
                        players.splice(i, 1);
                    }
                }
            },
            onClientMessage: function (data) {
                for (var i = 0; i < players.length; i++) {
                    if (players[i].uid === data.uid && data.uid != localUID) {
                        players[i].setAction(data.action);
                    }
                }
            },
            onDisconnect: function (data) {
                players = [];
                bombs = [];
            },
            updatePosFromEnemy: function (playerData) {
                for (var i = 0; i < players.length; i++) {
                    if (players[i].uid === playerData.uid) {
                        players[i].setPos(playerData.pos);
                    }
                }
            },
            init: function () {
                socket.on('connected', Client.onConnected);
                socket.on('clientConnect', Client.onClientConnect);
                socket.on('clientDisconnect', Client.onClientDisconnect);
                socket.on('clientMessage', Client.onClientMessage);
                socket.on('disconnect', Client.onDisconnect);
                socket.on('updatePosToAll', Client.updatePosFromEnemy);
            }
        };
        Client.init();

        var Bombs = {
            onUpdateBombPos: function (data) {
                for (var i = 0; i < bombs.length; i++) {
                    if (bombs[i].server_id == data.server_id) {
                        bombs[i].setPos(data.pos);
                    }
                }
            },
            onRemoveBombFromEnemy: function (server_id) {
                for (var i = 0; i < bombs.length; i++) {
                    if (bombs[i].server_id == server_id) {
                        me.game.remove(bombs[i]);
                        bombs.splice(i, 1);
                    }
                }
            },
            onNewBomb: function (data) {
                for (var i = 0; i < players.length; i++) {
                    if (players[i].uid === data.uid) {
                        players[i].createNewBomb(data);
                    }
                }
            },
            onSetBombServerID: function (data) {
                for (var i = 0; i < bombs.length; i++) {
                    if (bombs[i].id == data.id) {
                        bombs[i].server_id = data.server_id;
                    }
                }
            },
            getAll: function (bombs_data) {
                //console.log(bombs_data);
                for (var i = 0; i < bombs_data.length; i++) {
                    createNewBomb(bombs_data[i]);
                }
            },

            init: function () {
                socket.on('updateBombPos', Bombs.onUpdateBombPos);
                socket.on("removeBombFromEnemy", Bombs.onRemoveBombFromEnemy);
                socket.on("newBomb", Bombs.onNewBomb);
                socket.on("setBombServerID", Bombs.onSetBombServerID);
                socket.on('getAllBombs', Bombs.getAll);
            }
        };
        Bombs.init();


        createNewPlayer = function (data) {
            var gamePlayer = null;
            if (data.team == 1) {
                foo = "Gorilla"
            } else {
                foo = "Military"
            }
            if (data.uid == localUID) {
                gamePlayer = new Players.MainPlayer(data.x, data.y, {image: foo}, data.uid);
            } else {
                gamePlayer = new Players.EnemyPlayer(data.x, data.y, {image: foo}, data.uid);
            }
            me.game.add(gamePlayer, 99);
            me.game.sort();
            me.game.repaint();

            var gamePlayerObj = me.game.findGameObject(gamePlayer.uid);

            players.push(gamePlayerObj);
        };
        createNewBomb = function (data) {
            var bomb = new Bomb(data.id, data.server_id, data.x, data.y, data.direction, {image: data.bombtype});
            me.game.add(bomb, 99 + 1);
            var bombObj = me.game.getLastGameObject();
            if (!bombObj.isCollided()) {
                counter++;
                bombs.push(bombObj);
            }
            me.game.sort();
        }
    };
    return initNetwork;
});
