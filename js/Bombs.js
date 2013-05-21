/* --------------------------
 a bullet Entity
 ------------------------ */
define(function () {
    var Explosion = me.ObjectEntity.extend({

        init: function (x, y, settings) {
            settings.image = "Explosion";
            settings.spritewidth = 64;
            settings.spriteheight = 64;
            this.parent(x, y, settings);
            this.addAnimation("explode", [10, 20, 30, 40, 50, 60]);
            this.setCurrentAnimation('explode', function () {
                me.game.remove(this);
            });
        },

        update: function () {
            this.animationpause = false;
            this.parent();
            return true;
        }
    });

    var Melon = me.ObjectEntity.extend({
        init: function (x, y, direction, settings) {
            // define this here instead of tiled
            //console.log(settings.image);
            //settings.spritewidth = 32;
            //settings.spriteheight = 32;
            //console.log(x);
            //console.log(y);
            //this.pos.x=50;
            //this.pos.y=50;
            // call the parent constructor
            this.parent(x, y, settings);
            this.bombtype=settings.image;

            this.addAnimation("setMelonSprite", [9]);
            this.setCurrentAnimation("setMelonSprite");

            // make it collidable
            this.collidable = true;

            //this.startX = 10;
            //this.startY = 10;
            // walking & jumping speed
            this.setVelocity(6, 6);

            // make it collidable
            //this.collidable = true;
            // make it a enemy object
            //this.type = me.game.ENEMY_OBJECT;

            this.direction = direction;
            this.type = me.game.ACTION_OBJECT;
            this.bombIsSpam = true;
            this.timeout = setTimeout(function () {
                this.bombIsSpam = false;//set flags to avoid bomb in bomb spamming
            }.bind(this), 33);

        },

        // call by the engine when colliding with another object
        // obj parameter corresponds to the other object (typically the player) touching this one
        onCollision: function (res, obj) {
            // if we collide with an enemy
            if (obj.type == me.game.ENEMY_OBJECT) {
                this.flicker(45);
                var explosion = new Explosion(this.pos.x, this.pos.y, {});
                me.game.add(explosion, this.z + 1); //bullet should appear 1 layer before the mainPlayer
                me.game.sort();
                me.game.remove(this, true);
                // make sure it cannot be collidable "again"
                //this.collidable = false;
            }

            //if (obj.type == me.game.ACTION_OBJECT) {
            //    this.flicker(45);
            //}   
        },
        isCollided: function(){
            var collided= me.game.collide(this);
            if(collided && collided.obj.type == me.game.ACTION_OBJECT){
                me.game.remove(this, true);
                return true;
            }
            return false;
        },
        // manage the enemy movement
        update: function () {
            // do nothing if not visible
            if (!this.visible)
                return false;

            var collided = me.game.collide(this);
            if (!collided) {
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

                switch (this.direction) {//name of the animation
                    case 'walkLeft2':
                        this.vel.x -= 5;
                        break;
                    case 'walkRight2':
                        this.vel.x += 5;
                        break;
                    case 'walkUp2':
                        this.vel.y -= 5;
                        break;
                    case 'walkDown2':
                        this.vel.y += 5;
                }
            }

            if (collided) {
                if (collided.obj.type == me.game.ACTION_OBJECT) {
                    if (this.bombIsSpam) {
                        me.game.remove(this, true);
                        //socket.emit("removeBomb", { x: this.pos.x, y: this.pos.y});
                    }
                    this.vel.x = 0;
                    this.vel.y = 0;
                }
                // if we collide with an enemy
                if (collided.obj.type == me.game.ENEMY_OBJECT) {
                    // let's flicker in case we touched an enemy
                    this.flicker(45);
                }
            }

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
        }

    });
    return Melon;
});