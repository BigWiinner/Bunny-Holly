class Bunny extends Phaser.Scene {
    constructor() {
        super("bunnyScene");
        this.my = {sprite: {}};  // Create an object to hold sprite bindings

        this.aKey = null;
        this.leftKey = null;
        this.dKey = null;
        this.rightKey = null;
        this.spaceKey = null;
        
        this.my.sprite.carrot = [];
        this.maxCarrot = 5;
        this.timer = 0;
    }

    // Use preload to load art and sound assets before the scene starts running.
    preload() {
        // Assets from Kenny Assets pack "Jumper Pack"
        // https://kenney.nl/assets/jumper-pack
        this.load.setPath("./assets/");

        // blue sky background image
        this.load.image("background", "bg_layer1.png");
        // purple bunny ready
        this.load.image("bunny_ready", "bunny2_ready.png");
        // carrot
        this.load.image("carrot", "carrot.png");
        // properller enemy
        this.load.image("pro_aggro", "flyMan_fly.png");
        // ground texture
        this.load.image("ground", "ground_grass.png");
        // small bunnies for life meter
        this.load.image("health", "lifes.png");
        // winged enemy
        this.load.image("fly_aggro", "wingMan1.png");
        
        // update instruction text
        document.getElementById('description').innerHTML = '<h2>Bunny.js<br>S - smile // F - show fangs<br>A - move left // D - move right</h2>'
    }

    create() {
        let my = this.my;   // create an alias to this.my for readability

        my.sprite.background = this.add.sprite(0, 0, "background");

        my.sprite.ground = this.add.sprite(game.config.width / 2, 800, "ground");
        my.sprite.ground.displayWidth = game.config.width * 1.08;

        my.sprite.bunny = this.add.sprite(game.config.width / 2, 800 - my.sprite.ground.displayHeight, "bunny_ready");
        my.sprite.bunny.setScale(0.5);

        my.sprite.propel = this.add.sprite(game.config.width / 2, 50, "pro_aggro");
        my.sprite.propel.setScale(0.5);

        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        this.playerSpeed = 3;
        this.carrotSpeed = 8;
    }

    update() {
        let my = this.my;    // create an alias to this.my for readability
        this.timer++;

        if (this.aKey.isDown || this.leftKey.isDown) {
            if (my.sprite.bunny.x > my.sprite.bunny.displayWidth / 2) {
                my.sprite.bunny.x -= this.playerSpeed;
            }
        }

        if (this.dKey.isDown || this.rightKey.isDown) {
            if (my.sprite.bunny.x < (game.config.width - (my.sprite.bunny.displayWidth / 2))) {
                my.sprite.bunny.x += this.playerSpeed;
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            // If there is an open room for another carrot and after 30 frames, can fire again
            if (my.sprite.carrot.length < this.maxCarrot && this.timer > 30) {
                my.sprite.carrot.push(this.add.sprite(
                    my.sprite.bunny.x, my.sprite.bunny.y - (my.sprite.bunny.displayHeight / 2), "carrot"
                ).setScale(0.50).setAngle(225)); // 180 + 45 degrees
                this.timer = 0;
            }
        }

        for (let carrot of my.sprite.carrot) {
            carrot.y -= this.carrotSpeed;
            if (carrot.y < -(carrot.displayHeight / 2)) {
                carrot.setActive(false);
                carrot.setVisible(false);
            }
        }

        my.sprite.carrot = my.sprite.carrot.filter((carrot) => carrot.y > -(carrot.displayHeight/2));
        for (let carrot of my.sprite.carrot){
            if (this.collides(my.sprite.propel, carrot)) {
                carrot.y = -100;
            }
        }
    }

    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }
}