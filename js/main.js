require.config({
    baseUrl: 'js'
});
require(["resources","MainPlayers", "client"], function(g_resources, Players, initNetwork) {
	console.log("mainready");


    var jsApp =
    {
        /* ---

         Initialize the jsApp

         ---			*/
        onload: function () {
            // init the video
            if (!me.video.init('jsapp', 640, 480, false, 1.0)) {
                alert("Sorry but your browser does not support html 5 canvas.");
                return;
            }
            // initialize the "audio"
            me.audio.init("mp3,ogg");
            // set all resources to be loaded
            me.loader.onload = this.loaded.bind(this);
            // set all resources to be loaded
            me.loader.preload(g_resources);
            // load everything & display a loading screen
            me.state.change(me.state.LOADING);
        },

        /* ---

         callback when everything is loaded

         ---										*/
        loaded: function () {


            // set the "Play/Ingame" Screen Object
            me.state.set(me.state.PLAY, new PlayScreen());

            // setting global gravity 0
            me.sys.gravity = 0;

            // add our player entity in the entity pool
            //me.entityPool.add("MainPlayer", MainPlayer);
            /*
             @param1: className
             @param2: class
             @param3: objectPooling (if we want to allow more than 1 object of this)
             @param4: optional init values
             */
            //me.entityPool.add("Gorilla", Gorilla);
            //me.entityPool.add("Gorilla", Gorilla2);
            /*me.entityPool.add("Gorilla", Gorilla);
             me.entityPool.add("Gorilla", Gorilla);*/

            //var gorilla2= me.entityPool.newInstanceOf("Gorilla");
            //me.entityPool.add("Enemy", Enemy);
            //me.entityPool.add("Military", Military);

            //debugBox
            //me.debug.renderHitBox = true;

            // enable the keyboard
            //good old settings

            /* me.input.bindKey(me.input.KEY.A,  "left");
             me.input.bindKey(me.input.KEY.D, "right");
             me.input.bindKey(me.input.KEY.W,  "up");
             me.input.bindKey(me.input.KEY.S, "down");

             me.input.bindKey(me.input.KEY.LEFT,  "shootLeft");
             me.input.bindKey(me.input.KEY.RIGHT, "shootRight");
             me.input.bindKey(me.input.KEY.UP, "shootUp");
             me.input.bindKey(me.input.KEY.DOWN, "shootDown");*/



            //Settings for 2PlayerOn1Machine
            //player1

            me.input.bindKey(me.input.KEY.A, "left");
            me.input.bindKey(me.input.KEY.D, "right");
            me.input.bindKey(me.input.KEY.W, "up");
            me.input.bindKey(me.input.KEY.S, "down");

            /*me.input.bindKey(me.input.KEY.F, "shootLeft");
             me.input.bindKey(me.input.KEY.H, "shootRight");
             me.input.bindKey(me.input.KEY.T, "shootUp");
             me.input.bindKey(me.input.KEY.G, "shootDown");*/


            //old
            //me.input.bindKey(me.input.KEY.SPACE, "shoot");
            //me.input.bindKey(me.input.KEY.W, "jump", true);

            // start the game
            me.state.change(me.state.PLAY);

        }

    }; // jsApp

    var PlayScreen = me.ScreenObject.extend(
        {

            onResetEvent: function () {
                // stuff to reset on state change
                // load a level
                me.levelDirector.loadLevel("battlezone");



                /*initialize Network*/
                initNetwork();
            },

            /* ---

             action to perform when game is finished (state change)

             ---	*/
            onDestroyEvent: function () {

            }

        });


    window.onReady(function()
    {
	console.log("window ready");
        jsApp.onload();
    });

});


