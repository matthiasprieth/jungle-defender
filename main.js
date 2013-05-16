//game resources
var g_resources = [{
	//tmx-Object for all Images
    name: "battlezone",
    type: "tmx",
    src: "data/battlezone.tmx"
}, {
	//tmx-Object for all Images
    name: "metatiles32x32",
    type: "image",
    src: "data/battlezone_tileset/metatiles32x32.png"
}, {
    // game font
    name: "32x32_font",
    type: "image",
    src: "data/sprite/32x32_font.png"
}, {
	//gamefieldSprite1
    name: "TileB",
    type: "image",
    src: "data/battlezone_tileset/TileB.png"
}, {
	//gamefieldSprite2
    name: "JungleTileA2",
    type: "image",
    src: "data/battlezone_tileset/rainforest/1/JungleTileA2.png"
}, {
	//gamefieldSprite2
    name: "Wilderness-Jungle-04",
    type: "image",
    src: "data/battlezone_tileset/rainforest/2/Wilderness-Jungle-04.png"
}, {
	//animalPlayer1
    name: "Gorilla",
    type: "image",
    src: "data/sprite/mainPlayer/monkey/Gorilla.png"
}, {
	//Player images
	name: "chars",
    type: "image",
    src: "data/sprite/chars.png"
}, {
	//MilitaryPlayer images
	name: "Military",
    type: "image",
    src: "data/sprite/mainPlayer/military/Military.png"
}, {
	//Enemy images
	name: "Enemy",
    type: "image",
    src: "data/sprite/Enemy.png"
}, {
	//fruitBomb image
    name: "GreenCoconut",
    type: "image",
    src: "data/sprite/weapons/fruitBomb/GreenCoconut.png"
}, {
	//normalBomb image
    name: "Waterbomb",
    type: "image",
    src: "data/sprite/weapons/bomb/Waterbomb.png"
}, {
	//explosion image
    name: "Explosion",
    type: "image",
    src: "data/sprite/explosions/Explosion.png"
}];

var game	=
{
	/* ---
	
		Initialize the jsApp
		
		---			*/
	onload: function()
	{
		// init the video
		if (!me.video.init('jsapp', 640, 480, false, 1.0))
		{
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
	loaded: function ()
	{
		// set the "Play/Ingame" Screen Object
		me.state.set(me.state.PLAY, new game.PlayScreen());

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
		me.entityPool.add("Gorilla", Gorilla, true);
		me.entityPool.add("Enemy", Enemy);
		me.entityPool.add("Military", Military);
		//debugBox
		//me.debug.renderHitBox = true;

		// enable the keyboard
		//good old settings
		/*
		me.input.bindKey(me.input.KEY.A,  "left");
		me.input.bindKey(me.input.KEY.D, "right");
		me.input.bindKey(me.input.KEY.W,  "up");
		me.input.bindKey(me.input.KEY.S, "down");

		me.input.bindKey(me.input.KEY.LEFT,  "shootLeft");
		me.input.bindKey(me.input.KEY.RIGHT, "shootRight");
		me.input.bindKey(me.input.KEY.UP, "shootUp");
		me.input.bindKey(me.input.KEY.DOWN, "shootDown");
		*/



		//Settings for 2PlayerOn1Machine
		//player1
		me.input.bindKey(me.input.KEY.A,  "left");
		me.input.bindKey(me.input.KEY.D, "right");
		me.input.bindKey(me.input.KEY.W,  "up");
		me.input.bindKey(me.input.KEY.S, "down");

		me.input.bindKey(me.input.KEY.F,  "shootLeft");
		me.input.bindKey(me.input.KEY.H, "shootRight");
		me.input.bindKey(me.input.KEY.T, "shootUp");
		me.input.bindKey(me.input.KEY.G, "shootDown");

		//player2
		me.input.bindKey(me.input.KEY.J,  "left2");
		me.input.bindKey(me.input.KEY.L, "right2");
		me.input.bindKey(me.input.KEY.I,  "up2");
		me.input.bindKey(me.input.KEY.K, "down2");

		me.input.bindKey(me.input.KEY.LEFT,  "shootLeft2");
		me.input.bindKey(me.input.KEY.RIGHT, "shootRight2");
		me.input.bindKey(me.input.KEY.UP, "shootUp2");
		me.input.bindKey(me.input.KEY.DOWN, "shootDown2");

		//old
		//me.input.bindKey(me.input.KEY.SPACE, "shoot");
		//me.input.bindKey(me.input.KEY.W, "jump", true);

		// start the game
		me.state.change(me.state.PLAY);
	}

}; // jsApp

/*-------------- 
a score HUD Item
--------------------- */
 
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

/* the in game stuff*/
game.PlayScreen = me.ScreenObject.extend(
{

   onResetEvent: function()
	{
      // stuff to reset on state change
        // load a level
        me.levelDirector.loadLevel("battlezone");

         // add a default HUD to the game mngr
        me.game.addHUD(0, 430, 640, 60);

        me.game.HUD.addItem("Start", new game.HUD_Object(230, 10, "left", "START!"));
    	setTimeout(function () {
            me.game.HUD.removeItem("Start");
        }, 2000);
 
        // add a new HUD item
        me.game.HUD.addItem("scorePlayer1", new game.HUD_Object(620, 10, "right"));
        me.game.HUD.addItem("scorePlayer2", new game.HUD_Object(10, 10, "left"));

        setInterval(function(){
        	me.game.HUD.addItem("Shuffle", new game.HUD_Object(200, 10, "left", "SHUFFLE!"));
        	setTimeout(function () {
                me.game.HUD.removeItem("Shuffle");
            }, 2000);
        }, 10000);
        
        // make sure everything is in the right order
        me.game.sort();
	},

	/* ---
	
		action to perform when game is finished (state change)
		
		---	*/
	onDestroyEvent: function()
	{
		// remove the HUD
        me.game.disableHUD();
    }

});


//bootstrap :)
window.onReady(function()
{
	game.onload();
});
