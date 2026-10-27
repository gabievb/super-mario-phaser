import Phaser from "phaser";

export class PiranhaPlant extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, pipeTop, settings, index) {
        super(scene, x, pipeTop + 80, "piranha-closed");
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setOrigin(0.5, 1).setDepth(2).setImmovable(true);
        this.body.setAllowGravity(false);
        this.pipeTop = pipeTop;
        this.settings = settings;
        this.phase = "hidden";
        this.elapsed = -index * 450;
        this.reveal = 0;
        this.applyReveal(0);
    }

    applyReveal(height) {
        this.reveal = Math.round(Phaser.Math.Clamp(height, 0, 80));
        this.setVisible(this.reveal > 0);
        this.setCrop(0, 0, 48, Math.max(1, this.reveal));
        this.body.setSize(32, Math.max(1, this.reveal), false).setOffset(8, 0);
        this.body.reset(this.x, this.pipeTop + 80 - this.reveal);
        this.body.enable = this.reveal >= 6;
    }

    step(delta, player) {
        this.elapsed += delta;
        if (this.phase === "hidden") {
            const nearMouth =
                Math.abs(player.x - this.x) < 76 &&
                player.body.bottom > this.pipeTop - 20 &&
                player.body.top < this.pipeTop + 100;
            if (this.elapsed >= this.settings.hidden && !nearMouth) {
                this.phase = "rising";
                this.elapsed = 0;
                this.setTexture("piranha-closed");
            }
        } else if (this.phase === "rising") {
            this.applyReveal((80 * this.elapsed) / this.settings.rise);
            if (this.elapsed >= this.settings.rise) {
                this.phase = "exposed";
                this.elapsed = 0;
                this.setTexture("piranha-open");
                this.applyReveal(80);
                return true;
            }
        } else if (this.phase === "exposed") {
            if (this.elapsed >= this.settings.exposed) {
                this.phase = "falling";
                this.elapsed = 0;
                this.setTexture("piranha-closed");
                this.applyReveal(80);
            }
        } else if (this.phase === "falling") {
            this.applyReveal(80 * (1 - this.elapsed / this.settings.fall));
            if (this.elapsed >= this.settings.fall) {
                this.phase = "hidden";
                this.elapsed = 0;
                this.applyReveal(0);
            }
        }
        return false;
    }
}
