/**
 * Created with JetBrains PhpStorm.
 * User: Mitch
 * Date: 04.05.13
 * Time: 14:32
 * To change this template use File | Settings | File Templates.
 */
(function () {

    function init() {

        var localUID = 0;
        var players = [];

        /*socket.on('message', function (data) {
         console.log(data);
         });
         */


        socket.on('connected', function (data) {
            localUID = data.uid;
            console.log(localUID);

            console.log("Props");
            for (var prop in data.clients) {
                if (data.clients.hasOwnProperty(prop)) {
                    console.log(prop);
                    var client = data.clients[prop];
                    var player =
                    {
                        x: client.data.x,
                        uid: client.data.uid
                    };
                    players.push(player);
                }
            }

            socket.emit('clientMessage', {
                x: (Math.random() * 10),
                uid: localUID
            });

        });


        socket.on('clientConnect', function (data) {
            var player = {
                uid: data.uid,
                x:0
            };
            players.push(player);

            console.log(players);

        });



        socket.on('clientDisconnect', function (data) {
            console.log("clientDisconnect");
            for (var i = 0; i < players.length; i++) {
                if (players[i].uid === data.uid) {
                    players.splice(i, 1);
                }
            }
        });

        socket.on('clientMessage', function (data) {
            console.log("clientMessage");
            for (var i = 0; i < players.length; i++) {
                if(players[i].uid === data.uid) {
                    players[i].x= data.x;
                }
            }
        });

        socket.on('connect', function () {
            console.log('server');
        });

        socket.on('disconnect', function (data) {
            console.log("disconnect");
            players = [];
        });

    };


    window.onload = init;
})();