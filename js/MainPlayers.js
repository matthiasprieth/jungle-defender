/**
 */

/*-------------------
 a player entity
 -------------------------------- */

define(['Bombs'], function (Bomb) {


    counter = 1;

    var Player = me.ObjectEntity.extend({
        /* -----
         constructor
         ------ */
        init: function (x, y, settings, uid) {
            // call the constructor
            this.uid = uid;

            settings.spritewidth = 32;
            settings.spriteheight = 32;

            this.parent(x, y, settings);

            //this.updateColRect(0, 32, 18, 15); //set specific collision box
            //define the positions for the specific animation in the spritesheet
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

            // make it collidable
            this.collidable = true;
            this.type = me.game.ENEMY_OBJECT;

            // set the default horizontal & vertical speed (accel vector)
            this.setVelocity(12, 12);
            this.accel.x = 3;
            this.accel.y = 3;
            //this.addAnimation ("explosion", [0,1,2]);
        },
        setPos: function (data) {
            this.pos.x = data.x;
            this.pos.y = data.y;
        },

        onCollision: function (res, obj) {
            // if we collide with an enemy
            if (obj.type == me.game.ACTION_OBJECT) {
                //this.flicker(4);
                this.setOpacity(0.7);
            }
        },
        walkLeft: function () {
            this.setCurrentAnimation("walkLeft");
            this.vel.y = 0;
            this.vel.x -= this.accel.x * (60 / me.timer.fps);
        },
        walkLeftDown: function () {
            this.setCurrentAnimation("walkLeft");
            this.vel.y += this.accel.y * me.timer.tick;
            this.vel.x -= this.accel.x * (60 / me.timer.fps);
        },
        walkLeftUp: function () {
            this.setCurrentAnimation("walkLeft");
            this.vel.y -= this.accel.y * (60 / me.timer.fps);
            this.vel.x -= this.accel.x * (60 / me.timer.fps);
        },
        walkRight: function () {
            this.setCurrentAnimation("walkRight");
            this.vel.y = 0;
            this.vel.x += this.accel.x * (60 / me.timer.fps);
        },
        walkRightDown: function () {
            this.setCurrentAnimation("walkRight");
            this.vel.y += this.accel.y * (60 / me.timer.fps);
            this.vel.x += this.accel.x * (60 / me.timer.fps);
        },
        walkRightUp: function () {
            this.setCurrentAnimation("walkRight");
            this.vel.y -= this.accel.y * (60 / me.timer.fps);
            this.vel.x += this.accel.x * (60 / me.timer.fps);
        },
        walkUp: function () {
            this.setCurrentAnimation("walkUp");
            this.vel.x = 0;
            this.vel.y -= this.accel.y * (60 / me.timer.fps);
        },
        walkDown: function () {
            this.setCurrentAnimation("walkDown");
            this.vel.x = 0;
            this.vel.y += this.accel.y * (60 / me.timer.fps);
        },
        stand: function () {
            this.vel.x = 0;
            this.vel.y = 0;
            this.setAnimationFrame(1); //render the standing frame of every Animation if no key input action
        }
    });


    var EnemyPlayer = Player.extend({
        /* -----
         constructor
         ------ */
        init: function (x, y, settings, uid) {
            // call the constructor
            //those settings we could also save in the .tmx file for every entity

            this.action = "";
            this.parent(x, y, settings, uid);
        },
        setAction: function (action) {
            this.action = action;
        },
        createNewBomb: function (data) {

            var bomb = new Bomb(data.id, data.server_id, data.x, data.y, data.direction, {image: data.bombtype});
            //z-index of player=99 , 99 + 1

            me.game.add(bomb, 99 + 1); //bullet should appear 1 layer before the mainPlayer

            var bombObj = me.game.getLastGameObject();
            //console.log(melonObj.isCollided());
            //if (!bombObj.isCollided()) {
            counter++;

            bombs.push(bombObj);
            //}
            me.game.sort();
        },

        update: function () {
            var max_velocity = 3 * (60 / me.timer.fps);
            this.setVelocity(max_velocity, max_velocity);

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
        /* -----
         constructor
         ------ */
        init: function (x, y, settings, uid) {
            // call the constructor
            //those settings we could also save in the .tmx file for every entity
            //settings.image = "Gorilla";
            this.last_send_action = "";
            this.parent(x, y, settings, uid);

            // set the display to follow our position on both axis*/
            me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
            this.shootReady = true;
            this.sendPosition();

            //this.emitPosition();
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

                var shot = new Bomb(counter, 0, posX, posY, this.current.name, {image: "GreenCoconut", spritewidth: 32, spriteheight: 32});
                me.game.add(shot, this.z + 1); //bullet should appear 1 layer before the mainPlayer
                //socket.emit("getBombServerID", shot.id);
                var bombObj = me.game.getLastGameObject();
                //console.log(melonObj.isCollided());

                if (!bombObj.isCollided()) {
                    counter++;

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
                me.game.sort();
                this.shootReady = false;
                this.timeout = setTimeout(function () {
                    this.shootReady = true;
                }.bind(this), 400);

            }
        },
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
                // update the entity velocity
                //this.vel.x += this.accel.x * (60 / me.timer.fps);
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
            if (this.last_send_action != new_action) {
                this.last_send_action = new_action;
                socket.emit("clientMessage", {action: new_action, uid: this.uid});
            }
        },
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
