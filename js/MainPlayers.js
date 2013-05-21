/*-------------------
 a player entity
 -------------------------------- */

define(['Bombs'], function (Melon) {


    counter=1;

    var Player = me.ObjectEntity.extend({
        /* -----
         constructor
         ------ */
        init: function (x, y, settings) {
            // call the constructor
            this.parent(x, y, settings);
            // make it collidable
            this.collidable = true;
            this.type = me.game.ENEMY_OBJECT;
            //this.addAnimation ("explosion", [0,1,2]);
        },
        onCollision: function (res, obj) {
            //console.log(obj.type);
            //console.log(me.game.ENEMY_OBJECT);
            // if we collide with an enemy
            if (obj.type == me.game.ACTION_OBJECT) {
                //this.flicker(4);
                this.setOpacity(0.7);
                // make sure it cannot be collidable "again"
                //this.collidable = false;
            }
            //if (obj.type == me.game.ACTION_OBJECT) {
            //    //this.flicker(45);
            //}
        }
    });


    var Gorilla = Player.extend({
        /* -----
         constructor
         ------ */
        init: function (x, y, settings, uid) {
            // call the constructor
            //those settings we could also save in the .tmx file for every entity
            //console.log(settings);
            settings.image = "Gorilla";
            settings.spritewidth = 32;
            settings.spriteheight = 32;
            this.uid = uid;

            this.action = "";

            this.parent(x, y, settings);

            this.setTransparency("#78C380");
            this.updateColRect(0, 32, 18, 15); //set specific collision box

            this.addAnimation("walkDown", [0, 1, 2]);
            this.addAnimation("walkLeft", [3, 4, 5]);
            this.addAnimation("walkRight", [6, 7, 8]);
            this.addAnimation("walkUp", [9, 10, 11]);

            this.setVelocity(12, 12);
            this.accel.x = 3;
            this.accel.y = 3;
            //define the positions for the specific animation in the spritesheet
            /*if(this.uid==localUID){
             this.addAnimation("walkDown", [0, 1, 2]);
             this.addAnimation("walkLeft", [3, 4, 5]);
             this.addAnimation("walkRight", [6, 7, 8]);
             this.addAnimation("walkUp", [9, 10, 11]);

             this.setCurrentAnimation("walkDown");
             // set the default horizontal & vertical speed (accel vector)
             this.setVelocity(3, 3);
             // set the display to follow our position on both axis
             me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
             //this.shootReady = true;
             }*/

            //this.emitPosition();
        },
        setAction: function (action) {
            this.action = action;
        },
        /*shoot: function () {
         console.log(this.shootReady);
         var posX = this.pos.x;
         var posY = this.pos.y;

         if (this.shootReady === true) {
         clearTimeout(this.timeout);
         var widthOffset = this.width;
         var heightOffset = this.height;
         if (this.vel.x !== 0 || this.vel.y !== 0) {//if object moving set another Offset
         widthOffset += this.accel.x * 2;//dependency of player moving speed in x-direction
         heightOffset += this.accel.y * 2;//dependency of player moving speed in y-direction
         }
         switch (this.current.name) {//name of the animation
         case 'walkLeft':
         posX = this.pos.x - widthOffset;
         break;
         case 'walkRight':
         posX = this.pos.x + widthOffset;
         break;
         case 'walkUp':
         posY = this.pos.y - heightOffset;
         break;
         case 'walkDown':
         posY = this.pos.y + heightOffset;
         }
         var shot = new Melon(posX, posY, this.current.name, {image: "GreenCoconut", spritewidth: 32, spriteheight: 32});
         me.game.add(shot, this.z + 1); //bullet should appear 1 layer before the mainPlayer
         me.game.sort();
         this.shootReady = false;
         //var myPlayer = this;
         //console.log(this);
         this.timeout = setTimeout(function () {
         //console.log("shootReady Gorilla");
         this.shootReady = true;
         //console.log(this);
         }.bind(this), 400);
         //clearTimeout()
         }
         },*/

        /*
         emitPosition: function () {
         setInterval(function(){
         socket.emit('clientMessage', {
         x: this.pos.x,
         y: this.pos.y,
         uid: this.uid
         });
         }.bind(this),200);
         console.log("Piiiiiiiiiiiiiep");
         }*/
        /* -----
         update the player pos
         ------ ,*/
        update: function () {
            var max_velocity = 3 * (60 / me.timer.fps);
            this.setVelocity(max_velocity, max_velocity);

            switch (this.action) {
                case "left":
                    console.log(this.action);
                    this.setCurrentAnimation("walkLeft");
                    this.vel.y = 0;
                    this.vel.x -= this.accel.x * (60 / me.timer.fps);
                    break;
                case "leftdown":
                    console.log(this.action);
                    this.setCurrentAnimation("walkLeft");
                    this.vel.y += this.accel.y * me.timer.tick;
                    this.vel.x -= this.accel.x * (60 / me.timer.fps);
                    break;
                case "leftup":
                    console.log(this.action);
                    this.setCurrentAnimation("walkLeft");
                    this.vel.y -= this.accel.y * (60 / me.timer.fps);
                    this.vel.x -= this.accel.x * (60 / me.timer.fps);
                    break;
                case "right":
                    console.log(this.action);
                    this.setCurrentAnimation("walkRight");
                    this.vel.y = 0;
                    this.vel.x += this.accel.x * (60 / me.timer.fps);
                    break;
                case "rightdown":
                    console.log(this.action);
                    this.setCurrentAnimation("walkRight");
                    this.vel.y += this.accel.y * (60 / me.timer.fps);
                    this.vel.x += this.accel.x * (60 / me.timer.fps);
                    break;
                case "rightup":
                    console.log(this.action);
                    this.setCurrentAnimation("walkRight");
                    this.vel.y -= this.accel.y * (60 / me.timer.fps);
                    this.vel.x += this.accel.x * (60 / me.timer.fps);
                    break;
                case "up":
                    console.log(this.action);
                    this.setCurrentAnimation("walkUp");
                    this.vel.x = 0;
                    this.vel.y -= this.accel.y * (60 / me.timer.fps);
                    break;
                case "down":
                    console.log(this.action);
                    this.setCurrentAnimation("walkDown");
                    this.vel.x = 0;
                    this.vel.y += this.accel.y * (60 / me.timer.fps);
                    break;
                case "stand":
                    console.log(this.action);
                    this.vel.x = 0;
                    this.vel.y = 0;
                    this.setAnimationFrame(1); //render the standing frame of every Animation if no key input action
                    break;
                default:
                    this.vel.x = 0;
                    this.vel.y = 0;
                    this.setAnimationFrame(1); //render the standing frame of every Animation if no key input action
                    break;
                /*default:
                 this.vel.x = 0;
                 this.vel.y = 0;
                 this.setAnimationFrame(1); //render the standing frame of every Animation if no key input action
                 break;*/
            }


            this.updateMovement();

            // update animation if necessary
            if (this.vel.x !== 0 || this.vel.y !== 0) {
                // update object animation
                this.parent();
                return true;
            }


            /*
             if (me.input.isKeyPressed('shootLeft')) {
             this.setCurrentAnimation("walkLeft");
             this.shoot();
             }
             if (me.input.isKeyPressed('shootRight')) {
             this.setCurrentAnimation("walkRight");
             this.shoot();
             }
             if (me.input.isKeyPressed('shootUp')) {
             this.setCurrentAnimation("walkUp");
             this.shoot();
             }
             if (me.input.isKeyPressed('shootDown')) {
             this.setCurrentAnimation("walkDown");
             this.shoot();
             }
             */


            /*if (me.input.isKeyPressed('jump')) {
             // make sure we are not already jumping or falling
             if (!this.jumping && !this.falling) {
             // set current vel to the maximum defined value
             // gravity will then do the rest
             this.vel.y = -this.maxVel.y * me.timer.tick;
             // set the jumping flag
             this.jumping = true;
             }
             }*/
            // check & update player movement
            /*      this.updateMovement();
             var collided = me.game.collide(this);

             if (collided) {
             var that = this;
             // if we collide with an enemy
             if (collided.obj.type == me.game.ENEMY_OBJECT) {
             // let's flicker in case we touched an enemy
             //this.flicker(45);
             this.setOpacity(0.5);
             setTimeout(function () {
             that.setOpacity(1);
             }, 50);
             }
             if (collided.obj.type == me.game.ACTION_OBJECT) {
             // let's flicker in case we touched an enemy
             //this.flicker(45);
             this.setOpacity(0.3);
             setTimeout(function () {
             that.setOpacity(1);
             }, 2000);
             }
             }
             // update animation if necessary
             if (this.vel.x !== 0 || this.vel.y !== 0) {
             // update object animation
             this.parent();
             return true;
             }*/
            // else inform the engine we did not perform
            // any update (e.g. position, animation)
            return false;
        }/*,
         initKeys: function () {
         console.log("initKeys");
         //var canvas = document.getElementsByTagName("canvas")[0];
         this.action = "";
         this.prev_action = "";
         var keys = [];

         document.addEventListener('keypress', function (e) {

         console.log(e);
         switch (e.keyCode) {
         //'w'
         case 119:
         this.action = "up";
         console.log("w");
         break;
         //'a'
         case 97:
         this.action = "left";
         console.log("a");
         break;
         //'s'
         case 115:
         this.action = "down";
         console.log("s");
         break;
         //'d'
         case 100:
         this.action = "right";
         console.log("d");
         break;
         default:
         this.action = "";
         break;
         }
         ;
         if (this.action != "") {
         socket.emit('clientMessage', {
         event: this.action,
         uid: this.uid
         });
         }
         this.prev_action = this.action;


         }.bind(this), false);
         },
         movePlayer: function (event) {
         if (event == 'left') {

         this.setCurrentAnimation("walkLeft");
         if (me.input.isKeyPressed('down')) {
         this.vel.y += this.accel.y * me.timer.tick;
         } else if (me.input.isKeyPressed('up')) {
         this.vel.y -= this.accel.y * me.timer.tick;
         } else {
         this.vel.y = 0;
         }
         // update the entity velocity
         this.vel.x -= this.accel.x * me.timer.tick;
         } else if (event == 'right') {
         this.setCurrentAnimation("walkRight");
         if (me.input.isKeyPressed('down')) {
         this.vel.y += this.accel.y * me.timer.tick;
         } else if (me.input.isKeyPressed('up')) {
         this.vel.y -= this.accel.y * me.timer.tick;
         } else {
         this.vel.y = 0;
         }
         // update the entity velocity
         this.vel.x += this.accel.x * me.timer.tick;
         } else if (event == 'up') {
         this.setCurrentAnimation("walkUp");
         if (!me.input.isKeyPressed('right') || (me.input.isKeyPressed('left'))) {
         this.vel.x = 0;
         }
         // update the entity velocity
         this.vel.y -= this.accel.y * me.timer.tick;
         } else if (event == 'down') {
         this.setCurrentAnimation("walkDown");
         if (!me.input.isKeyPressed('right') || (me.input.isKeyPressed('left'))) {
         this.vel.x = 0;
         }
         // update the entity velocity
         this.vel.y += this.accel.y * me.timer.tick;
         }
         else {
         //reset the current animation to the first frame
         this.vel.x = 0;
         this.vel.y = 0;
         this.setAnimationFrame(1); //render the standing frame of every Animation if no key input action
         }
         }*/
    });

    var MainPlayer = Player.extend({
        /* -----
         constructor
         ------ */
        init: function (x, y, settings, uid) {
            // call the constructor
            //those settings we could also save in the .tmx file for every entity
            settings.image = "Gorilla";
            settings.spritewidth = 32;
            settings.spriteheight = 32;
            this.uid = uid;

            this.last_send_action = "";

            this.parent(x, y, settings);

            this.setTransparency("#78C380");
            this.updateColRect(0, 32, 18, 15); //set specific collision box
            //define the positions for the specific animation in the spritesheet

            this.addAnimation("walkDown", [0, 1, 2]);
            this.addAnimation("walkLeft", [3, 4, 5]);
            this.addAnimation("walkRight", [6, 7, 8]);
            this.addAnimation("walkUp", [9, 10, 11]);

            this.setCurrentAnimation("walkDown");
            // set the default horizontal & vertical speed (accel vector)
            this.setVelocity(12, 12);
            this.accel.x = 3;
            this.accel.y = 3;

            // set the display to follow our position on both axis*/
            me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
            this.shootReady = true;

            //this.emitPosition();
        },
        shoot: function () {
            var posX = this.pos.x;
            var posY = this.pos.y;

            if (this.shootReady === true) {
                clearTimeout(this.timeout);
                var widthOffset = this.width;
                var heightOffset = this.height;
                if (this.vel.x !== 0 || this.vel.y !== 0) {//if object moving set another Offset
                    widthOffset += this.accel.x * 2;//dependency of player moving speed in x-direction
                    heightOffset += this.accel.y * 2;//dependency of player moving speed in y-direction
                }
                switch (this.current.name) {//name of the animation
                    case 'walkLeft':
                        posX = this.pos.x - widthOffset;
                        break;
                    case 'walkRight':
                        posX = this.pos.x + widthOffset;
                        break;
                    case 'walkUp':
                        posY = this.pos.y - heightOffset;
                        break;
                    case 'walkDown':
                        posY = this.pos.y + heightOffset;
                }

                var shot = new Melon(counter, posX, posY, this.current.name, {image: "GreenCoconut", spritewidth: 32, spriteheight: 32});
                me.game.add(shot, this.z + 1); //bullet should appear 1 layer before the mainPlayer
                var melonObj= me.game.getLastGameObject();
                //console.log(melonObj.isCollided());

                if(!melonObj.isCollided()){
                    counter++;

                    bombs.push(melonObj);
                    socket.emit("bombMessage",{
                        id: melonObj.id,
                        x: melonObj.pos.x,
                        y: melonObj.pos.y,
                        direction: melonObj.direction,
                        bombtype: melonObj.bombtype
                    });
                }
                me.game.sort();
                this.shootReady = false;
                //var myPlayer = this;
                //console.log(this);
                this.timeout = setTimeout(function () {
                    //console.log("shootReady Gorilla");
                    this.shootReady = true;
                    //console.log(this);
                }.bind(this), 400);

            }
        },
        update: function () {
            //console.log(me.timer.fps);
            var max_velocity = 3 * (60 / me.timer.fps);
            this.setVelocity(max_velocity, max_velocity);

            if (me.input.isKeyPressed('left')) {
                //console.log("x: "+this.vel.x+" y: "+this.accel.y);
                this.setCurrentAnimation("walkLeft");
                if (me.input.isKeyPressed('down')) {

                    this.vel.y += this.accel.y * (60 / me.timer.fps);

                    if (this.last_send_action != "leftdown") {
                        this.last_send_action = "leftdown";
                        socket.emit("clientMessage", {action: "leftdown", uid: this.uid});

                    }

                } else if (me.input.isKeyPressed('up')) {
                    this.vel.y -= (this.accel.y * (60 / me.timer.fps));
                    if (this.last_send_action != "leftup") {
                        this.last_send_action = "leftup";
                        socket.emit("clientMessage", {action: "leftup", uid: this.uid});

                    }

                } else {
                    this.vel.y = 0;
                    if (this.last_send_action != "left") {
                        this.last_send_action = "left";
                        socket.emit("clientMessage", {action: "left", uid: this.uid});

                    }

                }
                // update the entity velocity
                this.vel.x -= this.accel.x * (60 / me.timer.fps);


                /*console.log("Velocity\n=========");
                 console.log("x: "+this.vel.x+" y: "+this.vel.y);
                 console.log(me.timer.tick);*/

            } else if (me.input.isKeyPressed('right')) {
                this.setCurrentAnimation("walkRight");
                if (me.input.isKeyPressed('down')) {
                    this.vel.y += this.accel.y * (60 / me.timer.fps);
                    if (this.last_send_action != "rightdown") {
                        this.last_send_action = "rightdown";
                        socket.emit("clientMessage", {action: "rightdown", uid: this.uid});

                    }

                } else if (me.input.isKeyPressed('up')) {
                    this.vel.y -= this.accel.y * (60 / me.timer.fps);
                    if (this.last_send_action != "rightup") {
                        this.last_send_action = "rightup";
                        socket.emit("clientMessage", {action: "rightup", uid: this.uid});

                    }

                } else {
                    this.vel.y = 0;
                    if (this.last_send_action != "right") {
                        this.last_send_action = "right";
                        socket.emit("clientMessage", {action: "right", uid: this.uid});

                    }

                }
                // update the entity velocity
                this.vel.x += this.accel.x * (60 / me.timer.fps);
            } else if (me.input.isKeyPressed('up')) {
                this.setCurrentAnimation("walkUp");
                if (!me.input.isKeyPressed('right') || (me.input.isKeyPressed('left'))) {
                    this.vel.x = 0;
                }
                this.vel.y -= this.accel.y * (60 / me.timer.fps);
                if (this.last_send_action != "up") {
                    this.last_send_action = "up";
                    socket.emit("clientMessage", {action: "up", uid: this.uid});

                }

                // update the entity velocity

            }
            else if (me.input.isKeyPressed('down')) {
                this.setCurrentAnimation("walkDown");

                if (!me.input.isKeyPressed('right') || (me.input.isKeyPressed('left'))) {
                    this.vel.x = 0;
                }
                // update the entity velocity
                this.vel.y += this.accel.y * (60 / me.timer.fps);
                if (this.last_send_action != "down") {
                    this.last_send_action = "down";
                    socket.emit("clientMessage", {action: "down", uid: this.uid});

                }
            }
            else {
                //reset the current animation to the first frame
                this.vel.x = 0;
                this.vel.y = 0;
                if (this.last_send_action != "stand") {
                    this.last_send_action = "stand";
                    socket.emit("clientMessage", {action: "stand", uid: this.uid});

                }

                this.setAnimationFrame(1); //render the standing frame of every Animation if no key input action
            }

            if (me.input.isKeyPressed('shootLeft')) {

                this.setCurrentAnimation("walkLeft");
                this.shoot();
            }
            if (me.input.isKeyPressed('shootRight')) {
                this.setCurrentAnimation("walkRight");
                this.shoot();
            }
            if (me.input.isKeyPressed('shootUp')) {
                this.setCurrentAnimation("walkUp");
                this.shoot();
            }
            if (me.input.isKeyPressed('shootDown')) {
                this.setCurrentAnimation("walkDown");
                this.shoot();
            }
            /*if (me.input.isKeyPressed('jump')) {
             // make sure we are not already jumping or falling
             if (!this.jumping && !this.falling) {
             // set current vel to the maximum defined value
             // gravity will then do the rest
             this.vel.y = -this.maxVel.y * me.timer.tick;
             // set the jumping flag
             this.jumping = true;
             }
             }*/
            // check & update player movement
            this.updateMovement();
            var collided = me.game.collide(this);

            if (collided) {
                var that = this;
                // if we collide with an enemy
                if (collided.obj.type == me.game.ENEMY_OBJECT) {
                    // let's flicker in case we touched an enemy
                    //this.flicker(45);
                    this.setOpacity(0.5);
                    setTimeout(function () {
                        that.setOpacity(1);
                    }, 50);
                }
                if (collided.obj.type == me.game.ACTION_OBJECT) {
                    // let's flicker in case we touched an enemy
                    //this.flicker(45);
                    me.game.HUD.updateItemValue("scorePlayer1", 1);

                    this.setOpacity(0.3);
                    setTimeout(function () {
                        that.setOpacity(1);
                    }, 2000);
                }
            }
            // update animation if necessary
            if (this.vel.x !== 0 || this.vel.y !== 0) {
                // update object animation
                this.parent();
                return true;
            }
            return false;
        }


    });

    return {
        'Gorilla': Gorilla,
        'MainPlayer': MainPlayer
    };
});