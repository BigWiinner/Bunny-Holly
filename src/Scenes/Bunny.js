class Bunny extends Phaser.Scene {
    constructor() {
        super("bunnyScene");
        this.my = {sprite: {}, text: {}};  // Create an object to hold sprite and text bindings

        this.aKey = null;
        this.leftKey = null;
        this.dKey = null;
        this.rightKey = null;
        this.spaceKey = null;
        this.enterKey = null;

        this.myScore = 0;
        this.begin = false;
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

        // spiked ball projectile
        this.load.image("spikeBall00", "spikeBall1.png");
        this.load.image("spikeBall01", "spikeBall_2.png");
        
        this.load.audio("sfx_throw", "footstep_carpet_003.ogg");
        
        this.load.bitmapFont("blockFont", "Kenny_Block_Font_0.png", "Kenny_Block_Font.fnt");

        // update instruction text
        document.getElementById('description').innerHTML = '<h2>Bunny.js<br>press enter to start or continue//use a and d or arrow keys to move//press space to fire</h2>'
    }

    create() {
        this.my.sprite.carrot = [];
        this.maxCarrot = 5;
        this.my.sprite.robotCarrot = [];
        this.maxRobotCarrot = 5;
        this.my.sprite.spikeBall = [];
        this.maxSpikeBall = 2;
        this.timer = 0;
        this.shootTimer = 0;
        this.gameOver = false;
        this.win = false;
        this.my.sprite.propeller = [];
        this.direction = -1;
        this.propellerSpeed = 5;
        this.damageTimer = 120;
        this.flyGone = false;
        this.flyGone2 = false;

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

        this.anims.create({
            key: "spikeBall",
            frames: [
                { key: "spikeBall00" },
                { key: "spikeBall01" }
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
        this.points = [
            50, 53,
            283,220,
            517,53,
            750,220,
            517,53,
            283,220,
            50, 53
        ];
        this.points2 = [
            750, 53,
            517, 220,
            400, 53,
            283, 220,
            50, 53,
            283, 220,
            400, 53,
            517, 220,
            750, 53
        ];

        this.curve = new Phaser.Curves.Spline(this.points);
        my.sprite.flyGuy = this.add.follower(this.curve, 20, 20, "fly_aggro00").setScale(0.5);
        my.sprite.flyGuy.anims.play("flyGuy", true);
        this.curve2 = new Phaser.Curves.Spline(this.points2);
        my.sprite.flyGuy2 = this.add.follower(this.curve2, 20, 20, "fly_aggro00").setScale(0.5);
        my.sprite.flyGuy2.anims.play("flyGuy", true);
        
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        this.playerSpeed = 2;
        this.carrotSpeed = 8;
        this.roboCarrotSpeed = 5;
        this.spikeBallSpeed = 8;

        my.text.fireControls = this.add.bitmapText(game.config.width / 2 - 190, game.config.height / 2 + 200, "blockFont", "space to fire").setScale(2.0);
        my.text.moveControls = this.add.bitmapText(game.config.width / 2 - 395, game.config.height / 2 + 100, "blockFont", "arrow keys or a and d to move").setScale(2.0);
        my.text.controls = this.add.bitmapText(game.config.width / 2 - 275, game.config.height / 2, "blockFont", "Press enter to start").setScale(2.0);
        my.text.score = this.add.bitmapText(580, 0, "blockFont", "Score " + this.myScore);
        my.text.lose = this.add.bitmapText(game.config.width / 2 - 250, game.config.height / 2, "blockFont", "Game over!").setScale(3.0);
        my.text.lose.visible = false;
        my.text.win = this.add.bitmapText(game.config.width / 2 - 200, game.config.height / 2, "blockFont", "You win!").setScale(3.0);
        my.text.win.visible = false;
        my.text.totalScore = this.add.bitmapText(my.text.win.x - 100, my.text.win.y + my.text.win.displayHeight, "blockFont", "Your score: " + this.myScore).setScale(3.0);
        my.text.totalScore.visible = false;
        my.text.toContinue = this.add.bitmapText(my.text.win.x + 20, my.text.win.y + my.text.win.displayHeight + 100, "blockFont", "Press enter to continue");
        my.text.toContinue.visible = false;

        my.sprite.flyGuy.x = this.curve.points[0].x;
        my.sprite.flyGuy.y = this.curve.points[0].y; 
        my.sprite.flyGuy.startFollow({
            from: 0,  
            to: 1,
            delay: 0,
            duration: 5000,
            ease: 'Circular.easeIn',
            repeat: -1,
            yoyo: false,
            rotateToPath: false,
            rotationOffset: -90 
        });
        my.sprite.flyGuy2.x = this.curve2.points[0].x;
        my.sprite.flyGuy2.y = this.curve2.points[0].y; 
        my.sprite.flyGuy2.startFollow({
            from: 0,
            to: 1,
            delay: 0,
            duration: 5000,
            ease: 'Circular.easeIn',
            repeat: -1,
            yoyo: true,
            rotateToPath: false,
            rotationOffset: -90
        });
    }

    update() {
        let my = this.my; // create an alias to this.my for readability
        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.begin = true;
        }
        if (!(this.gameOver || this.win) && this.begin) {
            my.text.controls.setVisible(false);
            my.text.moveControls.setVisible(false);
            my.text.fireControls.setVisible(false);
            this.timer++;
            this.shootTimer++;
            this.damageTimer++;
            for (let propel of my.sprite.propeller) {
                if (propel.visible && (propel.x < 100 || propel.x > game.config.width - 100)) {
                    this.changeDirection();
                }
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
                    rand = 100;
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

            if(my.sprite.spikeBall.length < this.maxSpikeBall && Math.ceil(Math.random() * 200) == 1 && my.sprite.flyGuy.visible) {
                my.sprite.spikeBall.push(this.add.sprite(
                    my.sprite.flyGuy.x, my.sprite.flyGuy.y + (my.sprite.flyGuy.displayHeight / 2), "spikeBall01"
                ).setScale(0.25).anims.play("spikeBall", true));
            }
            if(my.sprite.spikeBall.length < this.maxSpikeBall && Math.ceil(Math.random() * 200) == 1 && my.sprite.flyGuy2.visible) {
                my.sprite.spikeBall.push(this.add.sprite(
                    my.sprite.flyGuy2.x, my.sprite.flyGuy2.y + (my.sprite.flyGuy2.displayHeight / 2), "spikeBall01"
                ).setScale(0.25).anims.play("spikeBall", true));
            }

            for (let spike of my.sprite.spikeBall) {
                spike.y += this.spikeBallSpeed;
                if (spike.y > (game.config.height - (my.sprite.ground.displayHeight / 2))) {
                    spike.setActive(false);
                    spike.setVisible(false);
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
                        this.propellerSpeed += 2.5;
                        if (my.sprite.propeller.length == 1) {
                            this.propellerSpeed += 10;
                        }
                    }
                }
                if (this.collides(my.sprite.flyGuy, carrot)) {
                    carrot.y = -100;
                    this.myScore += 3;
                    this.updateScore();
                    my.sprite.flyGuy.stopFollow();
                    my.sprite.flyGuy.x = -100;
                    my.sprite.flyGuy.y = -100;
                    this.flyGone = true;
                }
                if (this.collides(my.sprite.flyGuy2, carrot)) {
                    carrot.y = -100;
                    this.myScore += 3;  
                    this.updateScore();
                    my.sprite.flyGuy2.stopFollow();
                    my.sprite.flyGuy2.x = -100;
                    my.sprite.flyGuy2.y = -100;
                    this.flyGone2 = true;
                }
            }
            if (this.flyGone) {
                my.sprite.flyGuy.x = -100;
            }
            if (this.flyGone2) {
                my.sprite.flyGuy2.x = -100;
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

            my.sprite.spikeBall = my.sprite.spikeBall.filter((spike) => spike.y < (game.config.height - (my.sprite.ground.displayHeight / 2)));
            for (let spike of my.sprite.spikeBall) {
                if (this.collides(my.sprite.bunny, spike)) {
                    spike.y = game.config.height + 100;
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
        else if (this.gameOver) {
            my.text.lose.visible = true;
            my.text.totalScore.setVisible(true);
            my.text.toContinue.setVisible(true);
            my.text.score.setVisible(false);
            my.sprite.flyGuy.stopFollow();
            my.sprite.flyGuy.anims.play("flyGuy", false);
            my.sprite.flyGuy2.stopFollow();
            my.sprite.flyGuy2.anims.play("flyGuy", false);
            my.sprite.bunny.setVisible(false);
            for (let robo of my.sprite.robotCarrot) {
                robo.setVisible(false);
            }
            for (let spike of my.sprite.spikeBall) {
                spike.setVisible(false);
            }
            for (let carrot of my.sprite.carrot) {
                carrot.setVisible(false);
            }
            if (this.enterKey.isDown) {
                this.myScore = 0;
                this.gameOver = false;
                this.scene.restart();
            }
        }
        else if (this.win) {
            my.text.win.setVisible(true);
            my.text.totalScore.setVisible(true);
            my.text.toContinue.setVisible(true);
            my.text.score.setVisible(false);
            my.sprite.flyGuy.stopFollow();
            my.sprite.flyGuy.anims.play("flyGuy", false);
            my.sprite.flyGuy.setVisible(false);
            my.sprite.flyGuy2.stopFollow();
            my.sprite.flyGuy2.anims.play("flyGuy", false);
            my.sprite.flyGuy2.setVisible(false);
            my.sprite.bunny.setVisible(true);
            for (let robo of my.sprite.robotCarrot) {
                robo.setVisible(false);
            }
            for (let spike of my.sprite.spikeBall) {
                spike.setVisible(false);
            }
            for (let carrot of my.sprite.carrot) {
                carrot.setVisible(false);
            }
            if (this.enterKey.isDown) {
                this.win = false;
                this.scene.restart(this.myScore);
            }
        }
        if (this.flyGone && this.flyGone2 && my.sprite.propeller.length === 0) {
            this.win = true;
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
        my.text.totalScore.setText("Your Score: " + this.myScore);
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