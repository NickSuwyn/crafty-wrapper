// class Entity {

//     constructor(name) {
//         this.instance = Crafty.e(name + ', Player, 2D, Canvas, Color, Solid, Collision')
//             .attr({x: 20, y: 100, w: 30, h: 30})
//             .color('#F00');
//         return this;
//     }

//     setPlatformerSpeeds(speed, jumpSpeed) {
//         this.instance.addComponent('Twoway')
//             .twoway(speed, jumpSpeed);
//         return this;
//     }

//     setGravity(gravity, collision = '') {
//         this.instance.addComponent('Gravity')
//             .gravity(collision)
//             .gravityConst(gravity);
//         return this;
//     }

// }

let keys = Crafty.keys;

var game_assets = {
    "sprites": {
        "pacman.gif": {
            tile: 32,
            tileh:32,
            map: {
                mrs_up: [0, 0],
                mrs_right: [1, 1],
                mrs_down: [3, 0],
                mrs_left: [6, 0]
            }
        },
      "player.jpg": {
        tile: 170,
        tileh: 250,
        map: {
          hero_idle: [0, 0],
          hero_walking: [1, 1],
          hero_jumping: [2, 3],
          hero_sitting: [0, 4]
        }
      }
    }
  };
   
  Crafty.load(game_assets);

class Entity {

    constructor(name, x = 0, y = 0) {
        this.name = name;
        this.timers = [];
        this.instance = Crafty.e(name + ', Canvas, Motion')
            .attr({x: x, y: y})
            .bind("EnterFrame", () => {
                this._evaluateTimers(this.timers);
            });
        return this;
    }

    init() {
        if (this.onKeyPress) {
            this.instance.addComponent('Keyboard');
            this.onKeyPressInit();
        }
        if (this.onKeyRelease) {
            this.instance.addComponent('Keyboard');
            this.onKeyReleaseInit();
        }
        if (this.sprite) {
            this.instance.addComponent(this.sprite);
        }
        if (this.onCollision) {
            this.instance.addComponent('Collision')
            this.onCollisionInit();
        }
    }

    /**
     * Event Methods - methods that are initiallized and call the implementing entity's methods
     */

    onKeyPressInit() {
        this.instance.bind('KeyDown', (e) => {
            this.onKeyPress(e.key);
        });
    }

    onKeyReleaseInit() {
        this.instance.bind('KeyUp', (e) => {
            this.onKeyRelease(e.key);
        });
    }

    onCollisionInit() {
        this.instance.bind('HitOn', (e) => {
            this.onCollision(e);
        });
    }

    /**
     * Action Methods - methods that can be called by an implementing entity to do something
     */

    addTimer(steps, action) {
        action.bind(this);
        this.timers.push({
            time: Crafty.frame() + steps, 
            action: action
        });
    }

    changeSprite(spriteString) {
        this.instance.removeComponent(this.sprite);
        this.instance.addComponent(spriteString);
        this.sprite = spriteString;
    }

    jump(speed = 300) {
        this.instance.jumpSpeed(speed);
        this.instance.jump();
    }

    setXVelocity(velocity) {
        this.instance.velocity().x = velocity;
    }

    getXVelocity() {
        return this.instance.velocity().x;
    }

    setYVelocity(velocity) {
        this.instance.velocity().y = velocity;
    }

    getYVelocity() {
        return this.instance.velocity().y;
    }

    setGravity(entity) {
        this.instance.addComponent('Jumper, Gravity')
            .gravity(entity);
    }

    setCollisionChecks(entities) {
        for (let entity of entities) {
            this.instance.checkHits(entity);
        }
    }

    get x() {
        return this.instance.x;
    }

    set x(x) {
       this.instance.x = x; 
    }

    get y() {
        return this.instance.y;
    }

    set y(y) {
        this.instance.y = y;
    }

    createEntity(entity, x = 0, y = 0, xSpeed = 0, ySpeed = 0) {
        let e = new entity(x, y);
        e.setXVelocity(xSpeed);
        e.setYVelocity(ySpeed);
    }

    /**
     * Private Methods
     */

    _evaluateTimers(timers) {
        for (let i = 0; i < this.timers.length; i++) {
            if (this.timers[i].time == Crafty.frame()) {
                this.timers.splice(i, 1)[0].action.bind(this)();
            }
        }
    }

}

class Floater extends Entity {

    constructor(x, y) {
        super('Floater', x, y);
        this.sprite = "mrs_right";
        this.init();
    }
}

class BadGuy extends Entity {

    constructor(x, y) {
        super('BadGuy', x, y);
        this.direction = 'Right';
        this.addTimer(35, this.move);
        this.sprite = "mrs_right";
        this.init();
        this.setXVelocity(500);
    }

    move() {
        if (this.direction == 'Right') {
            this.changeSprite('mrs_down');
            this.direction = 'Down';
            this.setXVelocity(0);
            this.setYVelocity(500);
        } else if (this.direction == 'Down') {
            this.changeSprite('mrs_left');
            this.direction = 'Left';
            this.setXVelocity(-500);
            this.setYVelocity(0);
        } else if (this.direction == 'Left') {
            this.changeSprite('mrs_up');
            this.direction = 'Up';
            this.setXVelocity(0);
            this.setYVelocity(-500);
        } else if (this.direction == 'Up') {
            this.changeSprite('mrs_right');
            this.direction = 'Right';
            this.setXVelocity(500);
            this.setYVelocity(0);
        }
        this.addTimer(35, this.move);
    }
}

class Player extends Entity {
    
    constructor() {
        super('Player');
        this.setGravity('Floor');
        this.health = 3;
        this.addTimer(300, () => console.log('This one worked too!'));
        this.sprite = "hero_idle";
        this.init();
        this.setCollisionChecks(['BadGuy', 'Drop']);
    }

    onKeyPress(key) {
        if (key == keys.SPACE) {
            this.createEntity(Floater, this.x, this.y, 500, 500);
        } else if (key == keys.RIGHT_ARROW) {
            this.setXVelocity(200);
        } else if (key == keys.LEFT_ARROW) {
            this.setXVelocity(-200);
        } else if (key == keys.UP_ARROW) {
            this.jump();
        }
    }

    onKeyRelease(key) {
        if (key == keys.RIGHT_ARROW || key == keys.LEFT_ARROW) {
            this.setXVelocity(0);
        }
    }

    onCollision(data) {
        if (this.instance.hit('BadGuy')) {
            console.log('Hit BadGuy');
            data[0].obj.destroy();
        } else {
            console.log('Hit something else.');
        }
    }

    myTimer() {
        console.log("timer!!!");
        console.log(this.health--);
        if (this.health > 0) {
            this.addTimer(100, this.myTimer);
        }
    }

}



// class Parent {

//     constructor() {
//         this.collisions = [];
//     }

//     init() {
//         if (this.a) {
//             console.log(this.a);
//         }
//     }

//     addCollision(name, action) {
//         this.collisions.push({name, action});
//         console.log(this.collisions);
//     }

// }

// class Child extends Parent {

//     constructor() {
//         super();
//         this.a = "hello";
//         this.addCollision('NameCollision', this.doIt);
//         this.init();
//     }

//     doIt() {
//         console.log('doing something');
//     }

//     // doB() {
//     //     console.log("b");
//     // }

// }