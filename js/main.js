/**
 */
require.config({
    baseUrl: 'js'
});
require(["resources", "MainPlayers", "client"], function (g_resources, Players, initNetwork) {


    var game =
    {
        /* ---

         Initialize the jsApp

         ---			*/
        onload: function () {
            // init the video
            if (!me.video.init('game', 640, 480, false, 1.0)) {
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
            //dadurch können wir das onblur listener deaktivieren bzw. dessen getriggerte
            //Funktion deaktivieren -> besser zum testen!
            me.state.pause = function (){};
            me.state.resume = function (){};
        },

        /* ---

         callback when everything is loaded

         ---										*/
        loaded: function () {


            // set the "Play/Ingame" Screen Object
            me.state.set(me.state.PLAY, new this.PlayScreen());

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

            //debugBox
            //me.debug.renderHitBox = true;

            // enable the keyboard
            //good old settings

            //Settings for 2PlayerOn1Machine
            //player1

            me.input.bindKey(me.input.KEY.A, "left");
            me.input.bindKey(me.input.KEY.D, "right");
            me.input.bindKey(me.input.KEY.W, "up");
            me.input.bindKey(me.input.KEY.S, "down");

            me.input.bindKey(me.input.KEY.F, "shootLeft");
            me.input.bindKey(me.input.KEY.H, "shootRight");
            me.input.bindKey(me.input.KEY.T, "shootUp");
            me.input.bindKey(me.input.KEY.G, "shootDown");

            // start the game
            me.state.change(me.state.PLAY);

        }

    }; // game


    game.HUD_Object = me.HUD_Item.extend({
        init: function(x, y, align, value) {
            // call the parent constructor
            this.parent(x, y);
            // create a font
            this.font = new me.BitmapFont("32x32_font", 32);
            this.font.set(align);
            if(value)
                this.value = value;
        },
     
        /* -----
     
        draw our score
     
        ------ */
        draw: function(context, x, y) {
            this.font.draw(context, this.value, this.pos.x + x, this.pos.y + y);
        }
     
    });

    game.PlayScreen = me.ScreenObject.extend(
        {

            onResetEvent: function () {
                // stuff to reset on state change
                // load a level
                me.levelDirector.loadLevel("battlezone");

                // add a default HUD to the game mngr
                me.game.addHUD(10, 10, 620, 460);

                me.game.HUD.addItem("connectingStatus", new game.HUD_Object(150, 200, "left", "CONNECTING"));
                
                setInterval(function(){
                    me.game.HUD.updateItemValue("connectingStatus", ".");
                }, 300);
                
                // timeLeft
                me.game.HUD.addItem("timeLeft", new game.HUD_Object(0, 0, "left", "-:--"));

                // add scores
                me.game.HUD.addItem("scoreTeam1", new game.HUD_Object(620, 420, "right"));
                me.game.HUD.addItem("scoreTeam2", new game.HUD_Object(0, 420, "left"));

                setInterval(function(){
                    me.game.HUD.addItem("Shuffle", new game.HUD_Object(185, 420, "left", "SHUFFLE!"));
                    setTimeout(function () {
                        me.game.HUD.removeItem("Shuffle");
                    }, 2000);
                }, 15000);

                // make sure everything is in the right order
                me.game.sort();

                /*initialize Network*/
                initNetwork();
            },
            /* ---

             action to perform when game is finished (state change)

             ---	*/
            onDestroyEvent: function () {
                // remove the HUD
                me.game.disableHUD();
            }

        });


    window.onReady(function () {
        console.log("window ready");
        game.onload();
    });

});


