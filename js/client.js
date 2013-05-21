/**
 * Created with JetBrains PhpStorm.
 * User: Mitch
 * Date: 04.05.13
 * Time: 14:32
 * To change this template use File | Settings | File Templates.
 */
define(['MainPlayers', 'Bombs'], function( Players, Melon) {
    //game resources
    var initNetwork = function() {

	socket= io.connect('/');
        localUID = 0;
        var players = [];

        bombs = [];
        /*socket.on('message', function (data) {
         console.log(data);
         });
         */

        socket.on('connected', function (data) {
            localUID = data.uid;
            for (var prop in data.clients) {
                if (data.clients.hasOwnProperty(prop)) {
                    var client = data.clients[prop];
                    /*var player =
                     {
                     x: client.data.x,
                     uid: client.data.uid
                     };
                     players.push(player);*/

                    //var posX=parseInt(Math.random()*20*32);
                    //var posY=parseInt(Math.random()*20*32);
                    //console.log(posX);
                    var gamePlayer= null;
                    if(client.data.uid==localUID){
                        gamePlayer= new Players.MainPlayer(client.data.x, client.data.y, {}, client.data.uid);
                    }else{
                        gamePlayer= new Players.Gorilla(client.data.x, client.data.y, {}, client.data.uid);
                    }
                    //var gorilla= new Gorilla(client.data.x, client.data.y, {}, client.data.uid);
                    //var gameObj=me.game.getGameObjects();
                    //console.log(gameObj);

                    me.game.add(gamePlayer, 99);
                    me.game.sort();


                    var gamePlayerObj=me.game.findGameObject(gamePlayer.uid);

                    /*setTimeout(function(){
                     b.pos.x=500;
                     console.log(b);
                     },2000);*/

                    /*var a=me.game.getEntityByName("gorilla");
                     console.log(a);*/
                    players.push(gamePlayerObj);

                    /*if(client.data.uid==localUID){
                     gorillaObj.initKeys();
                     }*/
                }
            }
            me.game.repaint();
            console.log("connected\n==============");
            console.log(players);
            console.log("==========");

            /*socket.emit('clientMessage', {
             x: (Math.random() * 10),
             uid: localUID
             });*/

        });

        socket.on('getAllBombs', function(bombs_data){
           console.log(bombs_data);
            for(var i=0;i<= bombs_data.length; i++){

                var shot = new Melon(counter, bombs_data[i].x, bombs_data[i].y, bombs_data[i].direction, {image: bombs_data[i].bombtype, spritewidth: 32, spriteheight: 32});
                //z-index of player=99 , 99 + 1
                me.game.add(shot, 99 + 1); //bullet should appear 1 layer before the mainPlayer

                var melonObj= me.game.getLastGameObject();
                //console.log(melonObj.isCollided());
		console.log(melonObj);
                if(!melonObj.isCollided()){
                    counter++;

                    bombs.push(melonObj);
                }
            }
            me.game.sort();
        });

        socket.on('clientConnect', function (data) {
            var gorilla= new Players.Gorilla(data.x, data.y, {}, data.uid);
            //var gameObj=me.game.getGameObjects();
            //console.log(gameObj);

            me.game.add(gorilla, 99);
            me.game.sort();
	    me.game.repaint();
            var gorillaObj=me.game.findGameObject(gorilla.uid);
            players.push(gorillaObj);
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
                if (players[i].uid === data.uid && data.uid!=localUID) {
                    console.log("sendAction");
                    players[i].setAction(data.action);
                }
            }

            /*for (var i = 0; i < players.length; i++) {
             if (players[i].uid === data.uid) {
             players[i].pos.x = data.x;
             players[i].pos.y = data.y;
             }
             }*/
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

    };
    return initNetwork;
});
