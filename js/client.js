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

        socket.on('connected', function (data) {
            localUID = data.uid;
            for (var prop in data.clients) {
                if (data.clients.hasOwnProperty(prop)) {
                    createNewPlayer(data.clients[prop].data);
                }
            }

            var timeLeft = data.timeLeft;
            me.game.HUD.setItemValue("timeLeft", toHHMMSS(timeLeft));
            setInterval(function () {
                timeLeft--;
                me.game.HUD.setItemValue("timeLeft", toHHMMSS(timeLeft));
            }, 1000);

            me.game.repaint();
            /*console.log("connected\n==============");
             console.log(players);
             console.log("==========");*/

            me.debug.renderHitBox = true;

        });
        socket.on('updateBombPos', function (data) {
            console.log("updateBombPos\n===================");
            console.log(data);
            console.log("===============");
            for (var i = 0; i < bombs.length; i++) {
                if (bombs[i].server_id == data.server_id) {
                    bombs[i].setPos(data.pos);
                }
            }
        });
        socket.on("removeBombFromEnemy", function (server_id) {
            for (var i = 0; i < bombs.length; i++) {
                if (bombs[i].server_id == server_id) {
                    me.game.remove(bombs[i]);
                    bombs.splice(i, 1);
                }
            }
        });
        socket.on("newBomb", function (data) {
            for (var i = 0; i < players.length; i++) {
                if (players[i].uid === data.uid) {
                    players[i].createNewBomb(data);
                }
            }

        });
        socket.on("setBombServerID", function (data) {
            for (var i = 0; i < bombs.length; i++) {
                if (bombs[i].id == data.id) {
                    bombs[i].server_id = data.server_id;
                }
            }
        });
        socket.on('getAllBombs', function (bombs_data) {
            //console.log(bombs_data);
            for (var i = 0; i < bombs_data.length; i++) {
                createNewBomb(bombs_data[i]);
            }
        });
        socket.on('updatePosToAll', function (playerData) {
            for (var i = 0; i < players.length; i++) {
                if (players[i].uid === playerData.uid) {
                    players[i].setPos(playerData.pos);
                }
            }
        });

        socket.on('clientConnect', function (data) {
            createNewPlayer(data);
            /*
             console.log("clientConnect\n==============");
             console.log(players);
             console.log("==========");*/
        });


        socket.on('clientDisconnect', function (data) {
            //console.log("clientDisconnect");
            for (var i = 0; i < players.length; i++) {
                if (players[i].uid === data.uid) {
                    me.game.remove(players[i]);
                    players.splice(i, 1);
                }
            }
            /*
             console.log("clientDisconnect\n==============");
             console.log(players);
             console.log("==========");*/
        });

        socket.on('clientMessage', function (data) {
            for (var i = 0; i < players.length; i++) {
                if (players[i].uid === data.uid && data.uid != localUID) {
                    //console.log("sendAction");
                    players[i].setAction(data.action);
                }
            }
        });

        socket.on('disconnect', function (data) {
            players = [];
        });
        createNewPlayer = function (data) {
            //var client = data.clients[prop];
            var gamePlayer = null;
            //if (data.uid == localUID) {
            //if (data.team == 1) {    
            var playerType;
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
