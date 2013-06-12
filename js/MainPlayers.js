// this file handels the player characters of the game
define(['Bombs'], function (Bomb) {


    // abstract Player Entity :
    // manages the player sprites, settings and their movement
    var Player = me.ObjectEntity.extend({
        // constructor function
        init: function (x, y, settings, uid) {
            // set unique id for each player
            this.uid = uid;

            // defines the movement state of the player
            this.action="stand";

            // set sprite size
            settings.spritewidth = 32;
            settings.spriteheight = 32;

            // call parent constructor
            this.parent(x, y, settings);

            // define the positions for the specific animation in the spritesheet
            if (settings.image == "Gorilla") {
                this.addAnimation("walkDown", [0, 1, 2]);
                this.addAnimation("walkLeft", [3, 4, 5]);
                this.addAnimation("walkRight", [6, 7, 8]);
                this.addAnimation("walkUp", [9, 10, 11]);
            } else if (settings.image == "Military") {
                this.addAnimation("walkDown", [0, 1, 2]);
                this.addAnimation("walkLeft", [12, 13, 14]);
                this.addAnimation("walkRight", [24, 25, 26]);
                this.addAnimation("walkUp", [36, 37, 38]);
            }

            this.setCurrentAnimation("walkDown");

            if (settings.image == "Gorilla"){
                this.team = 1;
            }else{
                this.team = 2;
            }

            // make it collidable
            this.collidable = true;

            // adjust the bounding box
            this.updateColRect(0, 32, 5, 27);

            // set type to ENEMY_OBJECT to distinguish between the different objects
            this.type = me.game.ENEMY_OBJECT;

            // set max speed
            this.setVelocity(12, 12);

            // set the default horizontal & vertical speed (accel vector)
            this.accel.x = 3;
            this.accel.y = 3;
        },
        // set new position of the player
        setPos: function (data) {
            this.pos.x = parseInt(data.x);
            this.pos.y = parseInt(data.y);
        },
        // checks and handles collision with bomb
        onCollision: function (res, obj) {
            // if we collide with a bomb
            if (obj.type == me.game.ACTION_OBJECT) {
                // visualize the collision
                this.setOpacity(0.7);
            }
        },
        // player walks left
        walkLeft: function () {
            // sets left-animation-sprites
            this.setCurrentAnimation("walkLeft");
            // and the right velocities
            this.vel.y = 0;
            this.vel.x -= this.accel.x * (60 / me.timer.fps);
        },
        // player walks left-down
        walkLeftDown: function () {
            // sets left-animation-sprites
            this.setCurrentAnimation("walkLeft");
            // and the right velocities
            this.vel.y += this.accel.y * me.timer.tick;
            this.vel.x -= this.accel.x * (60 / me.timer.fps);
        },
        // player walks left-up
        walkLeftUp: function () {
            // sets left-animation-sprites
            this.setCurrentAnimation("walkLeft");
            // and the right velocities
            this.vel.y -= this.accel.y * (60 / me.timer.fps);
            this.vel.x -= this.accel.x * (60 / me.timer.fps);
        },
        // player walks right
        walkRight: function () {
            // sets right-animation-sprites
            this.setCurrentAnimation("walkRight");
            // and the right velocities
            this.vel.y = 0;
            this.vel.x += this.accel.x * (60 / me.timer.fps);
        },
        // player walks right-down
        walkRightDown: function () {
            // sets right-animation-sprites
            this.setCurrentAnimation("walkRight");
            // and the right velocities
            this.vel.y += this.accel.y * (60 / me.timer.fps);
            this.vel.x += this.accel.x * (60 / me.timer.fps);
        },
        // player walks right-up
        walkRightUp: function () {
            // sets right-animation-sprites
            this.setCurrentAnimation("walkRight");
            // and the right velocities
            this.vel.y -= this.accel.y * (60 / me.timer.fps);
            this.vel.x += this.accel.x * (60 / me.timer.fps);
        },
        // player walks up
        walkUp: function () {
            // sets up-animation-sprites
            this.setCurrentAnimation("walkUp");
            // and the right velocities
            this.vel.x = 0;
            this.vel.y -= this.accel.y * (60 / me.timer.fps);
        },
        // player walks down
        walkDown: function () {
            // sets down-animation-sprites
            this.setCurrentAnimation("walkDown");
            // and the right velocities
            this.vel.x = 0;
            this.vel.y += this.accel.y * (60 / me.timer.fps);
        },
        // player stands
        stand: function () {
            // set velocity to zero
            this.vel.x = 0;
            this.vel.y = 0;
            this.setAnimationFrame(1); //render the standing frame of every Animation if no key input action
        }
    });

    // These objects are all other players, that are not controlled by this user.
    // They inherit from abstract player.
    var EnemyPlayer = Player.extend({
        // constructor function
        init: function (x, y, settings, uid) {

            // calls parent constructor
            this.parent(x, y, settings, uid);
        },
        // set new movement state
        setAction: function (action) {
            this.action = action;
        },
        // updates player movement and checks for collision
        update: function () {
            // set move distance depending on the current fps-number
            var max_velocity = 3 * (60 / me.timer.fps);
            this.setVelocity(max_velocity, max_velocity);

            // set velocities
            switch (this.action) {
                case "left":
                    this.walkLeft();
                    break;
                case "leftdown":
                    this.walkLeftDown();
                    break;
                case "leftup":
                    this.walkLeftUp();
                    break;
                case "right":
                    this.walkRight();
                    break;
                case "rightdown":
                    this.walkRightDown();
                    break;
                case "rightup":
                    this.walkRightUp();
                    break;
                case "up":
                    this.walkUp();
                    break;
                case "down":
                    this.walkDown();
                    break;
                case "stand":
                    this.stand();
                    break;
                default:
                    this.stand();
                    break;
            }

            // makes player movement
            this.updateMovement();

            // update animation if necessary
            if (this.vel.x !== 0 || this.vel.y !== 0) {
                // update object animation
                this.parent();
                return true;
            }
            return false;
        }
    });

    var MainPlayer = Player.extend({
        // constructor
        init: function (x, y, settings, uid) {

            // calls parent constructor
            this.parent(x, y, settings, uid);

            // unique local_bomb_id to distinguish between local bombs
            this.local_bomb_id=1;
            // set the display to follow our position on both axis
            me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);

            // determines, if player can should or not
            this.shootReady = true;

            // determines the shoot inverval
            this.SHOOT_INTERVAL = 700;
            // emit position to server
            this.sendPosition();
        },
        sendPosition: function () {
            var that = this;
            setInterval(function () {
                socket.emit("sendPos", {
                    uid: that.uid,
                    pos: that.pos
                });
            }, 500);
        },
        shoot: function () {
            console.log("shoot\n=======");
            console.log(bombs);

            console.log("================");
            // origin shoot position
            var posX = this.pos.x;
            var posY = this.pos.y;

            // timeout, so player can shoot only after specific time
            if (this.shootReady === true) {
                clearTimeout(this.timeout);

                var widthOffset = this.width;
                var heightOffset = this.height;

                // if object moving set another Offset
                if (this.vel.x !== 0 || this.vel.y !== 0) {
                    // dependency of player moving speed in x-direction
                    widthOffset += this.accel.x * 2;
                    // dependency of player moving speed in y-direction
                    heightOffset += this.accel.y * 2;
                }
                // name of the animation
                switch (this.current.name) {
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

                if (this.team === 1){ 
                    var shot = new Bomb(this.local_bomb_id, this.uid, 0, posX, posY, this.current.name, {image: "GreenCoconut", spritewidth: 32, spriteheight: 32});    
                }else{
                    var shot = new Bomb(this.local_bomb_id, this.uid, 0, posX, posY, this.current.name, {image: "Waterbomb", spritewidth: 32, spriteheight: 32});
                }
                
                // bomb should appear 1 layer before the mainPlayer
                me.game.add(shot, this.z + 1);
                var bombObj = me.game.getLastGameObject();
                this.local_bomb_id++;

                if (!bombObj.isCollided()) {


                    bombs.push(bombObj);
                    socket.emit("createBomb", {
                        uid: localUID,
                        id: bombObj.id,
                        server_id: bombObj.server_id,
                        x: bombObj.pos.x,
                        y: bombObj.pos.y,
                        direction: bombObj.direction,
                        bombtype: bombObj.bombtype
                    });
                }
                // sort the object list (to ensure the object is properly displayed)
                me.game.sort();
                this.shootReady = false;

                this.timeout = setTimeout(function () {
                    this.shootReady = true;
                }.bind(this), this.SHOOT_INTERVAL);

            }
        },
        // checks, which Key is pressed by the user and then sets player movement
        checkMoveControls: function () {
            var new_action = '';
            if (me.input.isKeyPressed('left')) {
                //this.setCurrentAnimation("walkLeft");
                if (me.input.isKeyPressed('down')) {
                    this.walkLeftDown();
                    new_action = "leftdown";
                } else if (me.input.isKeyPressed('up')) {
                    this.walkLeftUp();
                    new_action = "leftup";
                } else {
                    this.walkLeft();
                    new_action = "left";
                }

            } else if (me.input.isKeyPressed('right')) {
                //this.setCurrentAnimation("walkRight");
                if (me.input.isKeyPressed('down')) {
                    this.walkRightDown();
                    new_action = "rightdown";

                } else if (me.input.isKeyPressed('up')) {
                    this.walkRightUp();
                    new_action = "rightup";

                } else {
                    this.walkRight();
                    new_action = "right";
                }
            } else if (me.input.isKeyPressed('up')) {
                this.setCurrentAnimation("walkUp");
                if (!me.input.isKeyPressed('right') || (me.input.isKeyPressed('left'))) {
                    this.vel.x = 0;
                }
                this.vel.y -= this.accel.y * (60 / me.timer.fps);
                new_action = "up";
            }
            else if (me.input.isKeyPressed('down')) {
                this.setCurrentAnimation("walkDown");

                if (!me.input.isKeyPressed('right') || (me.input.isKeyPressed('left'))) {
                    this.vel.x = 0;
                }
                // update the entity velocity
                this.vel.y += this.accel.y * (60 / me.timer.fps);
                new_action = "down";
            }
            else {
                //reset the current animation to the first frame
                this.stand();
                new_action = "stand";
            }
            if (this.action != new_action) {
                this.action = new_action;
                socket.emit("clientMessage", {action: new_action, uid: this.uid});
            }
        },
        //checks, if shoot controls are pressed
        checkShootControls: function () {
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
        },
        checkCollision: function () {
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
                    //me.game.HUD.updateItemValue("scorePlayer1", 1);

                    this.setOpacity(0.3);
                    setTimeout(function () {
                        that.setOpacity(1);
                    }, 2000);
                }
            }
        },
        // updates player movement
        update: function () {
            var max_velocity = 3 * (60 / me.timer.fps);
            this.setVelocity(max_velocity, max_velocity);

            this.checkMoveControls();
            this.checkShootControls();

            // check & update player movement
            this.updateMovement();

            this.checkCollision();

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
        'EnemyPlayer': EnemyPlayer,
        'MainPlayer': MainPlayer
    };
});
