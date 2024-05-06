class Bunny extends Phaser.Scene {
    constructor() {
        super("bunnyScene");
        this.my = {sprite: {}, text: {}};  // Create an object to hold sprite bindings

        this.aKey = null;
        this.leftKey = null;
        this.dKey = null;
        this.rightKey = null;
        this.spaceKey = null;
        
        this.my.sprite.carrot = [];
        this.maxCarrot = 5;
        this.timer = 0;
        this.myScore = 0;
    }

    // Use preload to load art and sound assets before the scene starts running.
    preload() {
        // Assets from Kenny Assets pack "Jumper Pack"
        // https://kenney.nl/assets/jumper-pack
        this.load.setPath("./assets/");

        // blue sky background image
        this.load.image("background", "bg_layer1.png");
        // purple bunny ready sprite and walking sprites
        this.load.image("bunny_ready", "bunny2_ready.png");
        this.load.image("bunnyWalk00", "bunny2_walk1.png");
        this.load.image("bunnyWalk01", "bunny2_walk2.png");
        // small bunny for life meter
        this.load.image("life", "lifes.png");
        // carrot for player projectile
        this.load.image("carrot", "carrot.png");
        // properller enemy
        this.load.image("pro_aggro", "flyMan_fly.png");
        // ground texture
        this.load.image("ground", "ground_grass.png");
        // winged enemy
        this.load.image("fly_aggro", "wingMan1.png");
        
        this.load.audio("sfx_throw", "footstep_carpet_003.ogg");
        
        this.load.bitmapFont("blockFont", "Kenny_Block_Font_0.png", "Kenny_Block_Font.fnt");

        // update instruction text
        document.getElementById('description').innerHTML = '<h2>Bunny.js<br>PUT CONTROLS HERE</h2>'
    }

    create() {
        let my = this.my;   // create an alias to this.my for readability

        my.sprite.background = this.add.sprite(0, 0, "background");

        my.sprite.ground = this.add.sprite(game.config.width / 2, 800, "ground");
        my.sprite.ground.displayWidth = game.config.width * 1.08;

        my.sprite.bunny = this.add.sprite(game.config.width / 2, 800 - my.sprite.ground.displayHeight, "bunny_ready");
        my.sprite.bunny.setScale(0.5);

        my.sprite.life1 = this.add.sprite(game.config.width / 30, 20, "life").setScale(0.5);
        my.sprite.life2 = this.add.sprite(my.sprite.life1.x + 30, 20, "life").setScale(0.5);
        my.sprite.life3 = this.add.sprite(my.sprite.life2.x + 30, 20, "life").setScale(0.5);

        // create a walking animation
        this.anims.create({
            key: "walk",
            frames: [
                { key: "bunnyWalk00" },
                { key: "bunnyWalk01" },
            ],
            frameRate: 10,
            repeat: 0,
            hideOnComplete: true
        });
        this.walk = this.add.sprite(my.sprite.bunny.x, my.sprite.bunny.y, "bunnyWalk01").setScale(0.5);
        this.walk.setVisible(false);

        my.sprite.propel = this.add.sprite(game.config.width / 2, 50, "pro_aggro");
        my.sprite.propel.setScale(0.5);

        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.playerSpeed = 3;
        this.carrotSpeed = 8;

        my.text.score = this.add.bitmapText(580, 0, "blockFont", "Score " + this.myScore);
    }

    update() {
        let my = this.my;    // create an alias to this.my for readability
        this.timer++;
        my.text.score.setText("Score" + this.myScore);
        // Prevent movement if the player is holding a left and right
        // input down at the same time
        if ((this.aKey.isDown && this.dKey.isDown) || (this.leftKey.isDown && this.rightKey.isDown) || (this.aKey.isDown && this.rightKey.isDown) || (this.leftKey.isDown && this.dKey.isDown)) {
            this.walk.setVisible(false);
            my.sprite.bunny.x = this.walk.x;
            my.sprite.bunny.y = this.walk.y;
            my.sprite.bunny.setVisible(true);
        }
        // Check if the player is holding left input
        else if (this.aKey.isDown || this.leftKey.isDown) {
            if (this.walk.x > this.walk.displayWidth / 2) {
                this.walk.setFlipX(true);
                this.walk.setVisible(true);
                my.sprite.bunny.setVisible(false);
                this.walk.anims.play("walk", true);
                this.walk.x -= this.playerSpeed;
                my.sprite.bunny.x = this.walk.x;
                my.sprite.bunny.y = this.walk.y;
            }
            else {
                this.walk.setVisible(false);
                my.sprite.bunny.x = this.walk.x;
                my.sprite.bunny.y = this.walk.y;
                my.sprite.bunny.setVisible(true); 
            }
        }
        // Check if the player is holding right input
        else if (this.dKey.isDown || this.rightKey.isDown) {
            if (this.walk.x < (game.config.width - (this.walk.displayWidth / 2))) {
                // play walking animation
                this.walk.setFlipX(false);
                this.walk.setVisible(true);
                my.sprite.bunny.setVisible(false);
                this.walk.anims.play("walk", true);
                this.walk.x += this.playerSpeed;
                my.sprite.bunny.x = this.walk.x;
                my.sprite.bunny.y = this.walk.y;
            }
            else {
                this.walk.setVisible(false);
                my.sprite.bunny.x = this.walk.x;
                my.sprite.bunny.y = this.walk.y;
                my.sprite.bunny.setVisible(true); 
            }
        }

        else {
            this.walk.setVisible(false);
            my.sprite.bunny.x = this.walk.x;
            my.sprite.bunny.y = this.walk.y;
            my.sprite.bunny.setVisible(true);
        }

        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            // If there is an open room for another carrot and 
            // at or after 30 frames, can fire again
            if (my.sprite.carrot.length < this.maxCarrot && this.timer >= 45) {
                my.sprite.carrot.push(this.add.sprite(
                    my.sprite.bunny.x, my.sprite.bunny.y - (my.sprite.bunny.displayHeight / 2), "carrot"
                ).setScale(0.50).setAngle(225)); // 180 + 45 degrees
                this.sound.play("sfx_throw");
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
                this.myScore += 1;
            }
        }
    }

    collides(a, b) {
        // Function taken from L14: Collision detection / handling // animations
        // by Professor Jim Whitehead ejw@ucsc.edu
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }
}