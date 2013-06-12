/**
 * Bombs!
 */
define(function () {

    /**
     * @class Explosion
     * create and animates Explosion
     */
    var Explosion = me.ObjectEntity.extend({
        /**
         * @constructor
         * initialize sprites and animation for Explosion
         */
        init: function (x, y, settings) {
            /**
             * @cfg
             */
            settings.image = "Explosion";
            settings.spritewidth = 64;
            settings.spriteheight = 64;

            this.parent(x, y, settings);
            this.addAnimation("explode", [10, 20, 30, 40, 50, 60]);
            this.setCurrentAnimation('explode', function () {
                me.game.remove(this);
            });
        },
        /**
         * updates Explosion movement
         * @return{Boolean} Returns true for always updating the movement
         */
        update: function () {
            this.animationpause = false;
            this.parent();
            return true;
        }
    });

    makeExplosion = function (obj) {
        var explosion = new Explosion(obj.pos.x, obj.pos.y, {});
        me.game.add(explosion, obj.z + 1); //bullet should appear 1 layer before the mainPlayer
        me.game.sort();
    };

    /**
     * @class Melon
     * these are specific bombs for animals
     */
    var Bomb = me.ObjectEntity.extend({
        /**
         * @constructor
         * initialize sprites, animation for Explosion
         * and other properties
         */
        init: function (id, uid, server_id, x, y, direction, settings) {

            /**
             * @type{Number}
             * unique id for identifying object
             */
            this.id = id;
            this.uid=uid;
            this.server_id = server_id;
            this.bombtype = settings.image;
            settings.spritewidth = 32;
            settings.spriteheight = 32;

            // call the parent constructor

            this.parent(x, y, settings);


            this.addAnimation("setMelonSprite", [9]);
            this.setCurrentAnimation("setMelonSprite");

            /**
             * make it collidable
             */
            this.collidable = true;

            this.setVelocity(24, 24);

            this.accel.x = 6;
            this.accel.y = 6;
            /**
             * defines, if melon is stacked or not
             * @type {boolean}
             */
            this.stacked = false;

            this.bomb_updated = false;
            /**
             * direction of melon animation
             * @type {String}
             */
            this.direction = direction;


            this.type = me.game.ACTION_OBJECT;

            this.locked=false;

            /**
             * secure mechanism to prevent spaming,
             * melons should only create, if they don`t collide right now with a other object
             * @type {boolean}
             */
            this.bombIsSpam = true;
            /*this.timeout = setTimeout(function () {
                this.bombIsSpam = false;//set flags to avoid bomb in bomb spamming
            }.bind(this), 33);*/

        },

        // call by the engine when colliding with another object
        // obj parameter corresponds to the other object (typically the player) touching this one
        /**
         * on Collision with another Object, MelonJS calls this method
         * @param res
         * @param obj
         */
        setPos: function (pos) {
            this.pos.x = parseInt(pos.x);
            this.pos.y = parseInt(pos.y);
        },
        onCollision: function (res, obj) {
            // if we collide with an enemy
            if (obj.type == me.game.ENEMY_OBJECT) {
                //this.flicker(45);
                console.log("onCollision");
                makeExplosion(this);
                socket.emit("removeBomb", this.server_id);
            } 
            // if we collide with an enemy
            if (obj.type == me.game.ENEMY_OBJECT) {
                    console.log("collided with enemy");
                    me.game.remove(this);
                    socket.emit("removeBomb", this.server_id);
            }        
        },

        /**
         * Checks if an object is collided
         * @returns {boolean}
         */
        isCollided: function () {
            var collided = me.game.collide(this);
            if (collided && collided.obj.type == me.game.ACTION_OBJECT) {
                me.game.remove(this);
                return true;
            }
            return false;
        },

        onBombsCollision: function (obj) {
            if (obj.type == me.game.ACTION_OBJECT) {
                console.log("onBombsCollision");
                makeExplosion(this);
                me.game.remove(this);
                //socket.emit("removeBomb", this.server_id);
            }
        },
        onDestroyEvent: function () {

        },
        moveBomb: function (direction) {
            switch (this.direction) {//name of the animation
                case 'walkLeft':
                    this.vel.x -= 5;
                    break;
                case 'walkRight':
                    this.vel.x += 5;
                    break;
                case 'walkUp':
                    this.vel.y -= 5;
                    break;
                case 'walkDown':
                    this.vel.y += 5;
            }
        },
        checkCollision: function () {
            var collided = me.game.collide(this);

            if (collided) {
                if (collided.obj.type == me.game.ACTION_OBJECT) {

                    if (this.bomb_updated != true) {
                        this.vel.x = 0;
                        this.vel.y = 0;
                        this.stacked = true;
                        
                        console.log("bomb to emit: " + this);

                        socket.emit("updateBomb",{
                            server_id: this.server_id,
                            pos: this.pos
                        });
                        this.bomb_updated = true;
                    }
                }
            } else if (!this.stacked) {
                this.bomb_updated = false;
                this.moveBomb(this.direction);
            }
        },
        // manage the enemy movement
        update: function () {
            var max_velocity = 6 * (60 / me.timer.fps);
            this.setVelocity(max_velocity, max_velocity);

            this.checkCollision();

            // check and update movement
            this.updateMovement();

            // update animation if necessary
            if (this.vel.x !== 0 || this.vel.y !== 0) {
                // update object animation
                this.parent();
                return true;
            }

            //me.game.remove(this, true); //removing an object and force immidiate deletion with true
            return false;
        },
        makeExplosion: function(){
            makeExplosion(this);
        }

    });
    return Bomb;
});
