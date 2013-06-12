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
        var timeLeft = null;

        //testcase
        var onRoundEnd = function (data) {
            console.log("Team " + data.winnerTeam +": " + "has won with " + data.kills + " kills!");
            timeLeft = data.timeLeft;
            Bombs.clean();
        };
        socket.on('roundEnd', onRoundEnd);

        var Client = {
            onConnected: function (data) {
                localUID = data.uid;
                for (var prop in data.clients) {
                    if (data.clients.hasOwnProperty(prop)) {
                        createNewPlayer(data.clients[prop].data);
                    }
                }
                me.game.HUD.removeItem("connectingStatus");
                if (timeLeft === null) {
                    timeLeft = data.timeLeft;
                }
                me.game.HUD.setItemValue("timeLeft", toHHMMSS(timeLeft));
                setInterval(function () {
                    me.game.HUD.setItemValue("timeLeft", toHHMMSS(timeLeft));
                    timeLeft--;
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
                console.log("onUpdateBomb\n================");
                    
                for (var i = 0; i < bombs.length; i++) {
                    if (bombs[i].server_id == data.server_id) {
                        bombs[i].setPos(data.pos);
                    }
                    console.log(bombs[i].server_id);

                }
                console.log("============");
            },
            onRemoveBombFromEnemy: function (server_id) {
                for (var i = 0; i < bombs.length; i++) {
                    if (bombs[i].server_id == server_id) {
                        console.log("onRemoveBombFromEnemy");
                        me.game.remove(bombs[i]);
                        bombs.splice(i, 1);
                    }
                }
            },
            onNewBomb: function (data) {
                createNewBomb(data);
            },
            onSetBombServerID: function (data) {

                console.log("onSetBombServerID(data)");
               // console.log(data);
                for (var i = 0; i < bombs.length; i++) {
                   
                    if (bombs[i].id == data.id && bombs[i].uid==data.uid) {
                        console.log("setServerid");
                        bombs[i].server_id = data.server_id;
                    }
                    //console.log(i);
                    //console.log(bombs[i].id);
                     console.log(bombs[i].server_id);
                }
                console.log("===============");
            },
            getAll: function (bombs_data) {
                console.log("getAllBombs\n===============");
                console.log(bombs_data);
                console.log("==================");
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
            },
            clean: function () {      
                for (var i in bombs) {
                  me.game.remove(bombs[i]);
                }
                bombs = [];
            }
        };
        Bombs.init();


        createNewPlayer = function (data) {
            var gamePlayer = null;
            if (data.team == 1) {
                playerImage = "Gorilla"
            } else {
                playerImage = "Military"
            }
            if (data.uid == localUID) {
                gamePlayer = new Players.MainPlayer(data.x, data.y, {image: playerImage}, data.uid);
            } else {
                gamePlayer = new Players.EnemyPlayer(data.x, data.y, {image: playerImage}, data.uid);
            }
            me.game.add(gamePlayer, 99);
            me.game.sort();
            me.game.repaint();

            var gamePlayerObj = me.game.findGameObject(gamePlayer.uid);

            players.push(gamePlayerObj);
        };
        // creates new Bomb with data properties
        createNewBomb = function (data) {
            // Creates new Bomb with params: \n
            // data.id = local_bomb_id
            // data.server_id = unique bomb id
            // data.x and data.y = positions
            // data.direction = direction, where bomb should be fired
            // data.bombtype = type of bomb
            var bomb = new Bomb(data.id, data.uid, data.server_id, data.x, data.y, data.direction, {image: data.bombtype});
            // add the object and give the z index of the current object
            me.game.add(bomb, 99 + 1);
            // gets bomb object from melonjs api (needed to manage bombs externally)
            var bombObj = me.game.getLastGameObject();
            // save bomb into bombs array
            //if (!bombObj.isCollided()) {
                bombs.push(bombObj);
            //}
            // sort the object list (to ensure the object is properly displayed)
            me.game.sort();
            console.log(bombs);
        };
    };
    return initNetwork;
});
