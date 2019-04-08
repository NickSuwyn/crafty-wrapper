let keys = Crafty.keys;

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