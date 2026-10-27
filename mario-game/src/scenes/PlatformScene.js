import Phaser from "phaser";
import { createArt } from "../game/art.js";
import { WORLD_WIDTH, FLOOR_Y, LEVELS } from "../game/level.js";
import { PiranhaPlant } from "../gameobjects/PiranhaPlant.js";

export class PlatformScene extends Phaser.Scene {
    constructor() {
        super("PlatformScene");
    }

    init(data = {}) {
        this.levelIndex = Phaser.Math.Clamp(
            data.levelIndex ?? 0,
            0,
            LEVELS.length - 1,
        );
        this.level = LEVELS[this.levelIndex];
        this.entryState = {
            score: data.score ?? 0,
            coins: data.coins ?? 0,
            lives: data.lives ?? 3,
        };
    }

    create() {
        Object.assign(this, {
            ...this.entryState,
            remaining: this.level.time,
            paused: false,
            ended: false,
            dying: false,
            invulnerableUntil: 0,
            jumpBuffer: 0,
            groundedAt: -1000,
            jumpHeld: false,
            checkpoint: 96,
            lastHud: "",
            activeElapsed: 0,
            won: false,
        });
        createArt(this);
        this.touch = this.registry.get("touch");
        this.physics.world.setBounds(0, -240, WORLD_WIDTH, 1000);
        this.cameras.main.setBounds(0, 0, WORLD_WIDTH, 540);
        this.cameras.main.setBackgroundColor(this.level.theme.sky);
        this.buildBackdrop();
        this.platforms = this.physics.add.staticGroup();
        this.blocks = this.physics.add.staticGroup();
        for (const [start, end] of this.level.ground) {
            for (let x = start; x < end; x += 48) {
                this.platforms
                    .create(
                        x,
                        FLOOR_Y,
                        this.levelIndex === 2 ? "stone-ground" : "ground",
                    )
                    .setOrigin(0)
                    .refreshBody();
                this.add
                    .image(
                        x,
                        FLOOR_Y + 48,
                        this.levelIndex === 2 ? "stone-dirt" : "dirt",
                    )
                    .setOrigin(0);
            }
        }
        for (const [x, y, key] of this.level.blocks)
            this.blocks
                .create(x, y, key)
                .setData("question", key === "question");
        for (const [x, height] of this.level.pipes)
            this.platforms
                .create(x, FLOOR_Y - height, "pipe")
                .setOrigin(0.5, 0)
                .setDisplaySize(80, height)
                .setDepth(3)
                .refreshBody();
        for (let step = 0; step < 5; step++)
            for (let row = 0; row <= step; row++)
                this.platforms.create(
                    3936 + step * 48,
                    FLOOR_Y - 24 - row * 48,
                    "brick",
                );
        this.buildCastle();
        this.player = this.physics.add
            .sprite(96, FLOOR_Y - 28, "mario-idle")
            .setScale(1.5)
            .setDepth(5);
        this.player.setSize(18, 30).setOffset(7, 2).setMaxVelocity(330, 900);
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(
            this.player,
            this.blocks,
            this.hitBlock,
            undefined,
            this,
        );
        this.coinGroup = this.physics.add.staticGroup();
        this.level.coins.forEach(([x, y]) =>
            this.coinGroup.create(x, y, "coin"),
        );
        this.physics.add.overlap(
            this.player,
            this.coinGroup,
            (_player, coin) => {
                if (this.dying || this.ended) return;
                coin.destroy();
                this.addCoin();
            },
        );
        this.enemies = this.physics.add.group();
        for (const { x, left, right, health, speed } of this.level.enemies) {
            const enemy = this.enemies
                .create(
                    x,
                    FLOOR_Y - 20,
                    health === 3
                        ? "goomba-elite"
                        : health === 2
                          ? "goomba-armored"
                          : "goomba",
                )
                .setScale(1.4);
            enemy
                .setSize(24, 24)
                .setOffset(3, 4)
                .setVelocityX(-speed)
                .setData({
                    left,
                    right,
                    health,
                    maxHealth: health,
                    speed,
                    hitUntil: 0,
                });
            if (health > 1)
                enemy.setData(
                    "healthBar",
                    this.add
                        .rectangle(
                            x,
                            FLOOR_Y - 48,
                            22,
                            3,
                            health === 3 ? 0xad393b : 0x396476,
                        )
                        .setDepth(6),
                );
        }
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.collider(this.enemies, this.blocks);
        this.physics.add.overlap(
            this.player,
            this.enemies,
            this.hitEnemy,
            undefined,
            this,
        );
        this.plants = this.level.pipes.map(
            ([x, height], index) =>
                new PiranhaPlant(
                    this,
                    x,
                    FLOOR_Y - height,
                    this.level.plant,
                    index,
                ),
        );
        this.physics.add.overlap(
            this.player,
            this.plants,
            this.hitHazard,
            undefined,
            this,
        );
        this.projectiles = this.physics.add.group({
            allowGravity: false,
            maxSize: 16,
        });
        this.physics.add.collider(
            this.projectiles,
            this.platforms,
            (projectile) => projectile.destroy(),
        );
        this.physics.add.collider(this.projectiles, this.blocks, (projectile) =>
            projectile.destroy(),
        );
        this.physics.add.overlap(
            this.player,
            this.projectiles,
            this.hitHazard,
            undefined,
            this,
        );
        this.keys = this.input.keyboard.addKeys(
            "LEFT,RIGHT,UP,SPACE,A,D,W,SHIFT",
            false,
        );
        this.input.keyboard.on("keydown", (event) => {
            // Consume scrolling keys after Phaser has processed them, preserving dialog buttons.
            if (
                [
                    "Space",
                    "ArrowLeft",
                    "ArrowRight",
                    "ArrowUp",
                    "ArrowDown",
                ].includes(event.code) &&
                !event.target.closest(
                    "button, a, dialog, input, textarea, select",
                )
            )
                event.preventDefault();
        });
        this.cameras.main.startFollow(this.player, true, 0.09, 0.09, -160, 0);
        this.cameras.main.setDeadzone(80, 540);
        this.game.events.emit("newgame", {
            world: this.levelIndex + 1,
            totalWorlds: LEVELS.length,
            name: this.level.name,
            description: this.level.description,
        });
        this.emitHud();
    }

    buildBackdrop() {
        const hills = this.add.graphics().setScrollFactor(0.24);
        for (let x = -120; x < 2200; x += 420) {
            hills
                .fillStyle(this.level.theme.hill)
                .fillTriangle(x, FLOOR_Y, x + 190, 260, x + 390, FLOOR_Y);
            hills
                .fillStyle(this.level.theme.farHill)
                .fillTriangle(x + 90, FLOOR_Y, x + 300, 310, x + 470, FLOOR_Y);
            hills
                .fillStyle(0xa6c7a3)
                .fillRect(x + 178, 330, 5, 9)
                .fillRect(x + 202, 330, 5, 9);
        }
        for (let index = 0; index < 12; index++)
            this.add
                .image(100 + index * 290, 135 + (index % 3) * 31, "cloud")
                .setScale(index % 2 ? 0.7 : 1)
                .setScrollFactor(0.35);
        for (const x of [270, 560, 1170, 1770, 2230, 2730, 3100, 3600, 4340])
            this.add
                .image(x, FLOOR_Y, "bush")
                .setOrigin(0.5, 1)
                .setTint(this.level.theme.foliage)
                .setScale(x % 3 ? 1 : 0.7);
        if (this.levelIndex === 1) {
            const forest = this.add.graphics().setScrollFactor(0.6);
            for (let x = 160; x < WORLD_WIDTH; x += 320) {
                forest.fillStyle(0x98aa79).fillRect(x, 262, 18, 194);
                forest
                    .fillStyle(0xa9c189)
                    .fillRect(x - 54, 230, 126, 55)
                    .fillRect(x - 35, 204, 90, 80)
                    .fillRect(x - 15, 190, 50, 60);
            }
        }
        if (this.levelIndex === 2) {
            const battlements = this.add.graphics().setScrollFactor(0.5);
            for (let x = 100; x < WORLD_WIDTH; x += 310) {
                battlements.fillStyle(0xc5b2a4).fillRect(x, 284, 96, 172);
                for (let top = 0; top < 3; top++)
                    battlements.fillRect(x + top * 36, 265, 24, 22);
                battlements.fillStyle(0xa99792).fillRect(x + 40, 325, 16, 40);
            }
            for (let index = 0; index < this.level.ground.length - 1; index++) {
                const start = this.level.ground[index][1];
                const end = this.level.ground[index + 1][0];
                const lava = this.add
                    .rectangle(start, FLOOR_Y + 60, end - start, 32, 0xde6746)
                    .setOrigin(0);
                this.tweens.add({
                    targets: lava,
                    alpha: 0.65,
                    duration: 600,
                    yoyo: true,
                    repeat: -1,
                });
                this.add
                    .rectangle(start, FLOOR_Y + 60, end - start, 5, 0xffcd72)
                    .setOrigin(0);
            }
        }
        const flowers = this.add.graphics();
        for (let x = 180; x < WORLD_WIDTH; x += 317) {
            if (!this.level.ground.some(([a, b]) => x > a && x < b)) continue;
            flowers.fillStyle(0x547e4c).fillRect(x, FLOOR_Y - 13, 3, 13);
            flowers
                .fillStyle(x % 2 ? 0xf1d176 : 0xe89b90)
                .fillRect(x - 3, FLOOR_Y - 17, 9, 7);
            flowers.fillStyle(0xfff4cb).fillRect(x, FLOOR_Y - 15, 3, 3);
        }
    }

    buildCastle() {
        const g = this.add.graphics();
        g.fillStyle(0xd0c3a0).fillRect(4590, FLOOR_Y - 124, 156, 124);
        g.fillStyle(0xe0d5b8).fillRect(4582, FLOOR_Y - 130, 172, 20);
        for (let x = 4582; x < 4750; x += 36)
            g.fillRect(x, FLOOR_Y - 150, 20, 22);
        g.fillStyle(0x7c8d78)
            .fillRect(4650, FLOOR_Y - 59, 36, 59)
            .fillRect(4610, FLOOR_Y - 96, 14, 23)
            .fillRect(4710, FLOOR_Y - 96, 14, 23);
        g.lineStyle(1, 0xb6b297, 0.8);
        for (let y = FLOOR_Y - 108; y < FLOOR_Y; y += 24) {
            g.lineBetween(4590, y, 4746, y);
            for (let x = 4590; x < 4746; x += 36)
                g.lineBetween(
                    x + (y % 48 ? 0 : 18),
                    y,
                    x + (y % 48 ? 0 : 18),
                    y + 24,
                );
        }
        this.add.rectangle(4450, FLOOR_Y - 140, 6, 280, 0xeef0ce);
        this.add.rectangle(4450, FLOOR_Y - 283, 12, 12, 0xefd170);
        this.flag = this.add.graphics({ x: 4453, y: FLOOR_Y - 275 });
        this.flag.fillStyle(0xe34c3c).fillTriangle(0, 0, 66, 0, 0, 43);
        this.flag.fillStyle(0xffe9d4).fillRect(10, 10, 9, 9);
    }

    hitBlock(player, block) {
        if (
            !player.body.blocked.up ||
            !block.body.touching.down ||
            !block.getData("question") ||
            this.dying
        )
            return;
        block.setData("question", false).setTexture("used");
        this.addCoin();
        const coin = this.add.image(block.x, block.y - 40, "coin");
        this.tweens.add({
            targets: coin,
            y: coin.y - 64,
            alpha: 0,
            duration: 500,
            onComplete: () => coin.destroy(),
        });
        this.tweens.add({
            targets: block,
            y: block.y - 8,
            duration: 85,
            yoyo: true,
        });
    }

    addCoin() {
        this.coins++;
        this.score += 100;
        this.tone(900, 0.09, 1400);
        this.emitHud();
    }

    hitEnemy(player, enemy) {
        if (
            !this.isPlayerVulnerable() ||
            !enemy.active ||
            this.activeElapsed < enemy.getData("hitUntil")
        )
            return;
        const previousBottom = player.body.prev.y + player.body.height;
        if (
            player.body.velocity.y > 0 &&
            previousBottom <= enemy.body.top + 14
        ) {
            const health = enemy.getData("health") - 1;
            enemy.setData({ health, hitUntil: this.activeElapsed + 300 });
            player.setVelocityY(health > 0 ? -460 : -340);
            if (health > 0) {
                this.score += 50;
                enemy.setTint(0xffd7ac);
                enemy
                    .getData("healthBar")
                    .setDisplaySize(
                        (22 * health) / enemy.getData("maxHealth"),
                        3,
                    );
                this.time.delayedCall(150, () => {
                    if (enemy.active) enemy.clearTint();
                });
            } else {
                enemy.getData("healthBar")?.destroy();
                enemy.disableBody(true, false);
                enemy.setScale(1.4, 0.35).setY(FLOOR_Y - 5);
                this.time.delayedCall(230, () => enemy.destroy());
                this.score += 200 * enemy.getData("maxHealth");
            }
            this.tone(180, 0.12, 70);
            this.emitHud();
        } else this.loseLife();
    }

    isPlayerVulnerable() {
        return (
            !this.dying &&
            !this.ended &&
            !this.paused &&
            this.activeElapsed >= this.invulnerableUntil
        );
    }

    hitHazard(_player, hazard) {
        if (hazard.getData("projectile")) hazard.destroy();
        if (this.isPlayerVulnerable()) this.loseLife();
    }

    firePlant(plant) {
        if (Math.abs(this.player.x - plant.x) > 640 || this.dying) return;
        const projectile = this.projectiles.get(
            plant.x,
            plant.pipeTop - 63,
            "fireball",
        );
        if (!projectile) return;
        const angle = Phaser.Math.Angle.Between(
            projectile.x,
            projectile.y,
            this.player.x,
            this.player.y,
        );
        const speed = this.level.plant.projectileSpeed;
        projectile.setDepth(4).setData({ projectile: true, lifetime: 4000 });
        projectile.body.setCircle(7, 2, 2);
        projectile.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
        );
    }

    loseLife() {
        if (this.dying || this.ended) return;
        this.dying = true;
        this.lives--;
        this.game.events.emit("life", this.lives);
        this.emitHud();
        this.cameras.main.shake(180, 0.005);
        this.tone(260, 0.35, 80);
        this.player.setTint(0xf29688).setVelocity(0, -340);
        this.player.body.checkCollision.none = true;
        this.time.delayedCall(750, () => {
            if (this.lives <= 0) {
                this.finish(false);
                return;
            }
            this.player.body.reset(this.checkpoint, FLOOR_Y - 32);
            this.player.body.checkCollision.none = false;
            this.player.clearTint();
            this.dying = false;
            this.remaining = this.level.time;
            this.invulnerableUntil = this.activeElapsed + 1800;
            this.groundedAt = -1000;
            this.jumpBuffer = 0;
            this.cameras.main.flash(180, 235, 247, 225);
            this.emitHud();
        });
    }

    setPaused(paused) {
        if (this.ended || this.paused === paused) return;
        this.paused = paused;
        if (paused) {
            this.physics.pause();
            this.tweens.pauseAll();
            this.time.paused = true;
        } else {
            this.physics.resume();
            this.tweens.resumeAll();
            this.time.paused = false;
        }
        Object.keys(this.touch).forEach((key) => {
            this.touch[key] = false;
        });
        this.game.events.emit("pausechange", paused);
    }

    restartLevel() {
        this.time.paused = false;
        this.physics.resume();
        this.tweens.resumeAll();
        Object.keys(this.touch).forEach((key) => {
            this.touch[key] = false;
        });
        this.scene.restart({
            levelIndex: this.levelIndex,
            ...this.entryState,
            lives: 3,
        });
    }

    advanceLevel() {
        if (!this.ended || !this.won || this.levelIndex >= LEVELS.length - 1)
            return;
        this.physics.resume();
        this.scene.restart({
            levelIndex: this.levelIndex + 1,
            score: this.score,
            coins: this.coins,
            lives: this.lives,
        });
    }

    restartCampaign() {
        this.time.paused = false;
        this.physics.resume();
        this.scene.restart({ levelIndex: 0 });
    }

    finish(won) {
        if (this.ended) return;
        this.ended = true;
        this.won = won;
        this.physics.pause();
        this.player.clearTint().setAlpha(1);
        if (won) {
            this.score += Math.ceil(this.remaining) * 10 + 1000;
            this.tweens.add({
                targets: this.flag,
                y: FLOOR_Y - 60,
                duration: 850,
            });
            this.tone(520, 0.3, 1050);
        }
        this.emitHud();
        this.game.events.emit("finish", {
            won,
            score: this.score,
            coins: this.coins,
            world: this.levelIndex + 1,
            hasNext: won && this.levelIndex < LEVELS.length - 1,
        });
    }

    tone(frequency, duration, endFrequency = frequency) {
        if (
            this.registry.get("muted") ||
            !this.sound.context ||
            this.sound.context.state !== "running"
        )
            return;
        const context = this.sound.context;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "square";
        oscillator.frequency.setValueAtTime(frequency, context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
            endFrequency,
            context.currentTime + duration,
        );
        gain.gain.setValueAtTime(0.035, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(
            0.001,
            context.currentTime + duration,
        );
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + duration);
        oscillator.onended = () => {
            oscillator.disconnect();
            gain.disconnect();
        };
    }

    emitHud() {
        const state = {
            score: this.score,
            coins: this.coins,
            lives: this.lives,
            time: Math.max(0, Math.ceil(this.remaining)),
        };
        const key = JSON.stringify(state);
        if (key !== this.lastHud) {
            this.lastHud = key;
            this.game.events.emit("hud", state);
        }
    }

    update(now, delta) {
        if (!this.player || this.paused || this.ended) return;
        this.activeElapsed += delta;
        this.remaining = Math.max(0, this.remaining - delta / 1000);
        this.emitHud();
        for (const enemy of this.enemies.getChildren()) {
            if (!enemy.body.enable) continue;
            if (enemy.x <= enemy.getData("left") || enemy.body.blocked.left)
                enemy.setVelocityX(enemy.getData("speed"));
            else if (
                enemy.x >= enemy.getData("right") ||
                enemy.body.blocked.right
            )
                enemy.setVelocityX(-enemy.getData("speed"));
            enemy.setFlipX(Math.floor(now / 180) % 2 === 0);
            enemy
                .getData("healthBar")
                ?.setPosition(enemy.x, enemy.body.top - 7);
        }
        for (const plant of this.plants) {
            if (plant.step(delta, this.player) && this.level.plant.fire)
                this.firePlant(plant);
        }
        for (const projectile of [...this.projectiles.getChildren()]) {
            const remaining = projectile.getData("lifetime") - delta;
            projectile.setData("lifetime", remaining).setRotation(now / 120);
            if (
                remaining <= 0 ||
                projectile.x < 0 ||
                projectile.x > WORLD_WIDTH ||
                projectile.y < -200 ||
                projectile.y > 600
            )
                projectile.destroy();
        }
        if (this.dying) return;
        if (this.remaining <= 0 || this.player.y > 620) {
            this.loseLife();
            return;
        }
        const { LEFT, RIGHT, UP, SPACE, A, D, W, SHIFT } = this.keys;
        const left = LEFT.isDown || A.isDown || this.touch.left;
        const right = RIGHT.isDown || D.isDown || this.touch.right;
        const jump = SPACE.isDown || UP.isDown || W.isDown || this.touch.jump;
        const grounded = this.player.body.blocked.down;
        if (grounded) this.groundedAt = now;
        if (jump && !this.jumpHeld) this.jumpBuffer = now + 130;
        if (this.jumpBuffer > now && now - this.groundedAt < 100) {
            this.player.setVelocityY(-720);
            this.groundedAt = -1000;
            this.jumpBuffer = 0;
            this.tone(260, 0.11, 520);
        }
        if (!jump && this.jumpHeld && this.player.body.velocity.y < -230)
            this.player.setVelocityY(-230);
        this.jumpHeld = jump;
        const speed = SHIFT.isDown ? 315 : 245;
        this.player.setVelocityX((Number(right) - Number(left)) * speed);
        if (left !== right) this.player.setFlipX(left);
        this.player.setX(Math.max(18, this.player.x));
        this.player.setTexture(
            !grounded
                ? "mario-jump"
                : left !== right && Math.floor(now / 110) % 2
                  ? "mario-walk"
                  : "mario-idle",
        );
        this.player.setAlpha(
            this.activeElapsed < this.invulnerableUntil &&
                Math.floor(now / 90) % 2
                ? 0.45
                : 1,
        );
        for (const [trigger, spawn] of this.level.checkpoints) {
            if (this.player.x > trigger && this.player.x < trigger + 40)
                this.checkpoint = spawn;
        }
        if (this.player.x >= 4440) this.finish(true);
    }
}
