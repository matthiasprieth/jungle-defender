/**
 */
/**
 * Created with JetBrains PhpStorm.
 * User: Mitch
 * Date: 04.05.13
 * Time: 14:32
 * To change this template use File | Settings | File Templates.
 */
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
            me.game.repaint();
            console.log("connected\n==============");
            console.log(players);
            console.log("==========");

            me.debug.renderHitBox = true;

        });

        socket.on('getAllBombs', function (bombs_data) {
            console.log(bombs_data);
            for (var i = 0; i < bombs_data.length; i++) {
                createNewBomb(bombs_data[i]);
            }
        });

        socket.on('clientConnect', function (data) {
            createNewPlayer(data);
            console.log("clientConnect\n==============");
            console.log(players);
            console.log("==========");
        });


        socket.on('clientDisconnect', function (data) {
            console.log("clientDisconnect");
            for (var i = 0; i < players.length; i++) {
                if (players[i].uid === data.uid) {
                    me.game.remove(players[i]);
                    players.splice(i, 1);
                }
            }
            console.log("clientDisconnect\n==============");
            console.log(players);
            console.log("==========");
        });

        socket.on('clientMessage', function (data) {
            for (var i = 0; i < players.length; i++) {
                if (players[i].uid === data.uid && data.uid != localUID) {
                    console.log("sendAction");
                    players[i].setAction(data.action);
                }
            }
        });

        socket.on('connect', function () {
            console.log('connect');
        });

        socket.on('disconnect', function (data) {
            players = [];
            console.log("disconnect\n==============");
            console.log(players);
            console.log("==========");
        });
        createNewPlayer = function(data){
            //var client = data.clients[prop];
            var gamePlayer = null;
            if (data.uid == localUID) {
                gamePlayer = new Players.MainPlayer(data.x, data.y, {image: "Gorilla"}, data.uid);
            } else {
                gamePlayer = new Players.EnemyPlayer(data.x, data.y, {image: "Gorilla"}, data.uid);
            }
            me.game.add(gamePlayer, 99);
            me.game.sort();
            me.game.repaint();

            var gamePlayerObj = me.game.findGameObject(gamePlayer.uid);

            players.push(gamePlayerObj);
        };
        createNewBomb= function(data){
            var bomb = new Bomb(counter, data.x, data.y, data.direction, {image: data.bombtype});
            //z-index of player=99 , 99 + 1

            me.game.add(bomb, 99 + 1); //bullet should appear 1 layer before the mainPlayer

            var bombObj = me.game.getLastGameObject();
            //console.log(melonObj.isCollided());
            console.log(bombObj);
            if (!bombObj.isCollided()) {
                counter++;

                bombs.push(bombObj);
            }
            me.game.sort();
        }

    };
    return initNetwork;
});
