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
        this.my.sprite.robotCarrot = [];
        this.maxRobotCarrot = 5;
        this.timer = 0;
        this.shootTimer = 0;
        this.myScore = 0;
        this.gameOver = false;
        this.my.sprite.propeller = [];
        this.direction = -1;
        this.propellerSpeed = 5;
        this.damageTimer = 120;
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
        // propeller enemy
        this.load.image("pro_aggro", "flyMan_fly.png");
        // robot carrot for propeller enemy
        this.load.image("roboCarrot", "springMan_stand.png")
        // ground texture
        this.load.image("ground", "ground_grass.png");
        // winged enemy
        this.load.image("fly_aggro00", "wingMan1.png");
        this.load.image("fly_aggro01", "wingMan2.png");
        this.load.image("fly_aggro02", "wingMan3.png");
        this.load.image("fly_aggro03", "wingMan4.png");
        this.load.image("fly_aggro04", "wingMan5.png");
        
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

        this.anims.create({
            key: "flyGuy",
            frames: [
                { key: "fly_aggro00"},
                { key: "fly_aggro01"},
                { key: "fly_aggro02"},
                { key: "fly_aggro03"},
                { key: "fly_aggro04"},
                { key: "fly_aggro03"},
                { key: "fly_aggro02"},
                { key: "fly_aggro01"},
                { key: "fly_aggro00"},
            ],
            frameRate: 8,
            repeat: -1,
            hideOnComplete: false
        });

        this.walk = this.add.sprite(my.sprite.bunny.x, my.sprite.bunny.y, "bunnyWalk01").setScale(0.5);
        this.walk.setVisible(false);

        for (let i = 1; i <= 3; ++i){
            let neg = -1;
            let space = 0;
            for (let j = 0; j < 9; ++j) {
                my.sprite.propeller.push(this.add.sprite(
                    game.config.width / 2 + (neg * space), 72 * i, "pro_aggro"
                ).setScale(0.50));
                neg *= -1;
                if (j % 2 == 0){
                    space += 60;
                }
            }
        }

        my.sprite.flyGuy = this.add.sprite(game.config.width / 5, 50, "fly_aggro00").setScale(0.5);
        my.sprite.flyGuy.anims.play("flyGuy", true);

        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.playerSpeed = 3;
        this.carrotSpeed = 8;
        this.roboCarrotSpeed = 5;

        my.text.score = this.add.bitmapText(580, 0, "blockFont", "Score " + this.myScore);
        my.text.lose = this.add.bitmapText(game.config.width / 2 - 200, game.config.height / 2, "blockFont", "Game over!").setScale(3.0);
        my.text.lose.visible = false;
    }

    update() {
        let my = this.my; // create an alias to this.my for readability
        if (!this.gameOver) {
            this.timer++;
            this.shootTimer++;
            this.damageTimer++;
            for (let propel of my.sprite.propeller) {
                if (propel.visible && (propel.x < 100 || propel.x > game.config.width - 100)) {
                    this.changeDirection();
                }
            }
            if (my.sprite.flyGuy.x != -100 && this.timer % 20 == 0 && my.sprite.flyGuy.y < game.config.height - (my.sprite.bunny.displayHeight * 2.125)) {
                my.sprite.flyGuy.y += 2;
            }
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
                if (my.sprite.carrot.length < this.maxCarrot && this.shootTimer >= 45) {
                    my.sprite.carrot.push(this.add.sprite(
                        my.sprite.bunny.x, my.sprite.bunny.y - (my.sprite.bunny.displayHeight / 2), "carrot"
                    ).setScale(0.50).setAngle(225)); // 180 + 45 degrees
                    this.sound.play("sfx_throw");
                    this.shootTimer = 0;
                }
            }

            for (let carrot of my.sprite.carrot) {
                carrot.y -= this.carrotSpeed;
                if (carrot.y < -(carrot.displayHeight / 2)) {
                    carrot.setActive(false);
                    carrot.setVisible(false);
                }
            }

            let rand = 0;
            for (let propel of my.sprite.propeller){
                if (my.sprite.propeller.length > 18) {
                    rand = 750;
                }
                else if (my.sprite.propeller.length > 9) {
                    rand = 500;
                }
                else if (my.sprite.propeller.length > 1) {
                    rand = 250;
                }
                else {
                    rand = 125;
                }
                if (my.sprite.robotCarrot.length < this.maxRobotCarrot && Math.ceil(Math.random() * rand) == 1 && propel.visible) {
                        my.sprite.robotCarrot.push(this.add.sprite(
                            propel.x, propel.y + (propel.displayHeight / 2), "roboCarrot"
                        ).setScale(0.20));
                    }
            }
            my.sprite.propeller = my.sprite.propeller.filter((propel) => propel.x > 0);

            for (let robo of my.sprite.robotCarrot) { 
                robo.y += this.roboCarrotSpeed;
                if (robo.y > (game.config.height - (my.sprite.ground.displayHeight / 2))) {
                    robo.setActive(false);
                    robo.setVisible(false);
                }
            }

            my.sprite.carrot = my.sprite.carrot.filter((carrot) => carrot.y > -(carrot.displayHeight/2));
            for (let carrot of my.sprite.carrot) {
                for (let propel of my.sprite.propeller){
                    if (this.collides(propel, carrot)) {
                        carrot.y = -100;
                        this.myScore += 1;
                        this.updateScore();
                        propel.setVisible(false);
                        propel.x = -100;
                        this.propellerSpeed += 2; // May need to adjust?
                        // TODO INSERT AUDIO
                    }
                }
                if (this.collides(my.sprite.flyGuy, carrot)) {
                    carrot.y = -100;
                    this.myScore += 3;
                    this.updateScore();
                    my.sprite.flyGuy.setVisible(false);
                    my.sprite.flyGuy.x = -100;
                    // TODO INSERT AUDIO
                }
            }

            // Cleanup shot roboCarrots
            my.sprite.robotCarrot = my.sprite.robotCarrot.filter((robotCarrot) => robotCarrot.y < (game.config.height - (my.sprite.ground.displayHeight / 2)));
            for (let robo of my.sprite.robotCarrot) {
                if (this.collides(my.sprite.bunny, robo)) {
                    robo.y = game.config.height + 100;
                    if (my.sprite.life3.visible) {
                        my.sprite.life3.setVisible(false);
                        this.damageTimer = 0;
                    }
                    else if (my.sprite.life2.visible && this.damageTimer > 120) {
                        my.sprite.life2.setVisible(false);
                        this.damageTimer = 0;
                    }
                    else if (my.sprite.life1.visible && this.damageTimer > 120) {
                        my.sprite.life1.setVisible(false);
                        this.gameOver = true;
                    }
                }
            }

            for (let propel of my.sprite.propeller) {
                // Move propeller enemies around the map, space invaders style
                if (propel.x != -100 && this.timer % 20 == 0) {
                    propel.x += (this.direction * this.propellerSpeed);
                    if (propel.visible && propel.y >= game.config.height - (propel.displayHeight / 2) - (my.sprite.ground.displayHeight / 2) - 10) {
                        this.gameOver = true;
                    }
                }
            }
        }
        else {
            my.text.lose.visible = true;
        }
    }

    collides(a, b) {
        // Function taken from L14: Collision detection / handling // animations
        // by Professor Jim Whitehead ejw@ucsc.edu
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }

    updateScore() {
        // Function taken from ArrayBoom.js
        // by Professor Jim Whitehead ejw@ucsc.edu
        let my = this.my;
        my.text.score.setText("Score " + this.myScore);
    }

    changeDirection() {
        let my = this.my;
        this.direction *= -1;
        for (let propel of my.sprite.propeller) {
            if (this.direction == 1) {
                propel.x += this.propellerSpeed;
            }
            else {
                propel.x -= this.propellerSpeed;
            }
            propel.y += 30;
        }
    }
}