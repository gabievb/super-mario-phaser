import { test, expect } from "@playwright/test";

let runtimeErrors = [];

test.beforeEach(async ({ page }) => {
    runtimeErrors = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    await page.goto("/");
    await page.locator("canvas").waitFor();
    await page.waitForFunction(
        () =>
            window.__MARIO_GAME__?.scene.getScene("PlatformScene")?.player?.body
                ?.blocked.down,
    );
    await page.evaluate(() => {
        window.testScene =
            window.__MARIO_GAME__.scene.getScene("PlatformScene");
    });
    await expect(page.locator("canvas")).toHaveCount(1);
});

test.afterEach(() => expect(runtimeErrors).toEqual([]));

test("renders a nonblank, animated game on desktop", async ({
    page,
}, testInfo) => {
    await expect(page.locator("#lives")).toHaveText("03");
    const colors = await page.evaluate(
        () =>
            new Promise((resolve) => {
                window.testScene.game.renderer.snapshot((image) => {
                    const canvas = document.createElement("canvas");
                    canvas.width = 960;
                    canvas.height = 540;
                    const context = canvas.getContext("2d");
                    context.drawImage(image, 0, 0);
                    const data = context.getImageData(0, 0, 960, 540).data;
                    const colors = new Set();
                    for (let index = 0; index < data.length; index += 64)
                        colors.add(
                            `${data[index]},${data[index + 1]},${data[index + 2]},${data[index + 3]}`,
                        );
                    resolve(colors.size);
                });
            }),
    );
    expect(colors).toBeGreaterThan(25);
    const before = await page.locator("canvas").screenshot();
    await page.waitForTimeout(250);
    const after = await page.locator("canvas").screenshot();
    expect(before.equals(after)).toBe(false);
    expect(
        await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
        ),
    ).toBe(true);
    await page.screenshot({
        path: testInfo.outputPath("desktop.png"),
        fullPage: true,
    });
});

test("keyboard movement and variable-height jump work", async ({ page }) => {
    const start = await page.evaluate(() => ({
        x: window.testScene.player.x,
        y: window.testScene.player.y,
    }));
    await page.keyboard.down("ArrowRight");
    await page.waitForFunction(
        (x) => window.testScene.player.x > x + 40,
        start.x,
    );
    await page.keyboard.up("ArrowRight");
    expect(
        await page.evaluate(() => window.testScene.player.x),
    ).toBeGreaterThan(start.x + 30);
    await page.keyboard.down("Space");
    await page.waitForFunction(
        (y) => window.testScene.player.y < y - 60,
        start.y,
    );
    expect(await page.evaluate(() => window.testScene.player.y)).toBeLessThan(
        start.y - 50,
    );
    await page.keyboard.up("Space");
    await page.waitForFunction(() => window.testScene.player.body.blocked.down);
    expect(
        await page.evaluate(() => window.testScene.player.body.blocked.down),
    ).toBe(true);
});

test("pause freezes physics and timer, and restart resets state", async ({
    page,
}) => {
    await page.locator("#pause").click();
    await expect(page.locator("#game-dialog")).toBeVisible();
    const before = await page.evaluate(() => ({
        time: window.testScene.remaining,
        x: window.testScene.enemies.getFirstAlive().x,
    }));
    await page.waitForTimeout(450);
    expect(
        await page.evaluate(() => ({
            time: window.testScene.remaining,
            x: window.testScene.enemies.getFirstAlive().x,
        })),
    ).toEqual(before);
    await page.keyboard.press("Escape");
    await expect(page.locator("#game-dialog")).not.toBeVisible();
    await page.waitForTimeout(100);
    expect(await page.evaluate(() => window.testScene.remaining)).toBeLessThan(
        before.time,
    );
    await page.keyboard.press("p");
    await page.locator("#dialog-restart").click();
    await expect(page.locator("#game-dialog")).not.toBeVisible();
    await expect(page.locator("#score")).toHaveText("000000");
    await expect(page.locator("#lives")).toHaveText("03");
});

test("collects coins and activates surprise blocks only once", async ({
    page,
}) => {
    await page.evaluate(() => window.testScene.player.body.reset(336, 230));
    await expect(page.locator("#coins")).toHaveText("01");
    await expect(page.locator("#score")).toHaveText("000100");
    await page.evaluate(() => {
        const s = window.testScene;
        s.player.body.reset(384, 370);
        s.player.setVelocityY(-450);
    });
    await expect(page.locator("#coins")).toHaveText("02");
    expect(
        await page.evaluate(() =>
            window.testScene.blocks
                .getChildren()
                .find((block) => block.x === 384)
                .getData("question"),
        ),
    ).toBe(false);
    await page.waitForTimeout(350);
    await page.evaluate(() => {
        const s = window.testScene;
        s.player.body.reset(384, 370);
        s.player.setVelocityY(-450);
    });
    await page.waitForTimeout(200);
    await expect(page.locator("#coins")).toHaveText("02");
});

test("can jump onto the first platform from the ground", async ({ page }) => {
    await page.evaluate(() => window.testScene.player.body.reset(285, 432));
    await page.waitForTimeout(80);
    await page.keyboard.down("Space");
    await page.waitForFunction(() => window.testScene.player.y < 270);
    await page.keyboard.down("ArrowRight");
    await page.waitForFunction(() => window.testScene.player.x >= 336);
    await page.keyboard.up("ArrowRight");
    await page.keyboard.up("Space");
    await page.waitForFunction(() => window.testScene.player.body.blocked.down);
    const state = await page.evaluate(() => ({
        y: window.testScene.player.y,
        grounded: window.testScene.player.body.blocked.down,
    }));
    expect(state.y).toBeLessThan(300);
    expect(state.grounded).toBe(true);
});

test("stomps an enemy and awards points", async ({ page }) => {
    await page.evaluate(() => {
        const s = window.testScene;
        const enemy = s.enemies.getFirstAlive();
        enemy.body.reset(1300, enemy.y);
        enemy.setVelocityX(0);
        s.player.body.reset(enemy.x, enemy.body.top - 38);
        s.player.setVelocityY(200);
    });
    await expect(page.locator("#score")).toHaveText("000200");
    await expect(page.locator("#lives")).toHaveText("03");
});

test("enemy contact loses one life and respawns safely", async ({ page }) => {
    await page.evaluate(() => {
        const s = window.testScene;
        const enemy = s.enemies.getFirstAlive();
        s.player.body.reset(enemy.x - 15, enemy.y);
    });
    await expect(page.locator("#lives")).toHaveText("02");
    await page.waitForFunction(() => !window.testScene.dying);
    expect(
        await page.evaluate(() => ({
            x: window.testScene.player.x,
            dying: window.testScene.dying,
        })),
    ).toEqual({ x: 96, dying: false });
});

test("falling three times ends the game, then replay starts fresh", async ({
    page,
}) => {
    for (let life = 2; life >= 0; life--) {
        await page.evaluate(() =>
            window.testScene.player.body.reset(1600, 630),
        );
        await expect(page.locator("#lives")).toHaveText(`0${life}`);
        await page.waitForFunction(
            () => !window.testScene.dying || window.testScene.ended,
        );
    }
    await expect(page.locator("#dialog-title")).toHaveText("Vamos de novo?");
    await page.locator("#dialog-primary").click();
    await expect(page.locator("#lives")).toHaveText("03");
    await expect(page.locator("#score")).toHaveText("000000");
});

test("the timer expires and consumes a life", async ({ page }) => {
    await page.evaluate(() => {
        window.testScene.remaining = 0.01;
    });
    await expect(page.locator("#lives")).toHaveText("02");
    await page.waitForFunction(() => !window.testScene.dying);
    expect(
        await page.evaluate(() => window.testScene.remaining),
    ).toBeGreaterThan(178);
});

test("reaching the flag unlocks the next world and keeps the score", async ({
    page,
}) => {
    await page.evaluate(() => window.testScene.player.body.reset(4445, 410));
    await expect(page.locator("#dialog-title")).toHaveText("Mundo 1 completo!");
    const score = await page.locator("#score").textContent();
    expect(Number(score)).toBeGreaterThan(1000);
    await page.locator("#dialog-primary").click();
    await expect(page.locator("#game-status")).toHaveText("EM JOGO");
    await expect(page.locator("#current-world-label")).toHaveText(
        "MUNDO 2 / 3",
    );
    await expect(page.locator("#score")).toHaveText(score);
    await page.locator("#sound").click();
    await expect(page.locator("#sound")).toHaveAttribute(
        "aria-pressed",
        "false",
    );
});

async function startWorld(page, levelIndex) {
    await page.evaluate(
        (index) => window.testScene.scene.restart({ levelIndex: index }),
        levelIndex,
    );
    await page.waitForFunction(
        (index) =>
            window.testScene.levelIndex === index &&
            window.testScene.player?.body?.blocked.down,
        levelIndex,
    );
}

test("plants emerge after a delay, retract and have no hidden hitbox", async ({
    page,
}, testInfo) => {
    expect(await page.evaluate(() => window.testScene.plants[0].phase)).toBe(
        "hidden",
    );
    expect(
        await page.evaluate(() => window.testScene.plants[0].body.enable),
    ).toBe(false);
    await page.waitForFunction(
        () => window.testScene.plants[0].phase === "exposed",
    );
    expect(await page.evaluate(() => window.testScene.plants[0].reveal)).toBe(
        80,
    );
    await page.evaluate(() => {
        const camera = window.testScene.cameras.main;
        camera.stopFollow();
        camera.setScroll(520, 0);
    });
    await page.screenshot({
        path: testInfo.outputPath("plant-exposed.png"),
        fullPage: true,
    });
    await page.waitForFunction(
        () => window.testScene.plants[0].phase === "hidden",
    );
    expect(
        await page.evaluate(() => ({
            reveal: window.testScene.plants[0].reveal,
            enabled: window.testScene.plants[0].body.enable,
        })),
    ).toEqual({ reveal: 0, enabled: false });
});

test("a plant stays hidden beside Mario and damages him even from above", async ({
    page,
}) => {
    await page.evaluate(() => {
        const s = window.testScene;
        const plant = s.plants[0];
        s.player.body.reset(plant.x, plant.pipeTop - 24);
        plant.elapsed = plant.settings.hidden + 100;
    });
    await page.waitForTimeout(250);
    expect(await page.evaluate(() => window.testScene.plants[0].phase)).toBe(
        "hidden",
    );
    await expect(page.locator("#lives")).toHaveText("03");
    await page.evaluate(() => window.testScene.player.body.reset(96, 432));
    await page.waitForFunction(
        () => window.testScene.plants[0].phase === "exposed",
    );
    await page.evaluate(() => {
        const s = window.testScene;
        const plant = s.plants[0];
        s.player.body.reset(plant.x, plant.body.top - 38);
        s.player.setVelocityY(200);
    });
    await expect(page.locator("#lives")).toHaveText("02");
    expect(await page.evaluate(() => window.testScene.plants[0].active)).toBe(
        true,
    );
});

for (const levelIndex of [1, 2])
    test(`world ${levelIndex + 1} has stronger enemies requiring ${levelIndex + 1} stomps`, async ({
        page,
    }) => {
        await startWorld(page, levelIndex);
        await page.evaluate((health) => {
            const s = window.testScene;
            window.armoredEnemy = s.enemies
                .getChildren()
                .find((enemy) => enemy.getData("maxHealth") === health);
            s.enemies
                .getChildren()
                .filter((enemy) => enemy !== window.armoredEnemy)
                .forEach((enemy) => enemy.disableBody(true, true));
            s.coinGroup.clear(true, true);
            window.armoredEnemy.body.reset(600, 430);
        }, levelIndex + 1);
        for (let health = levelIndex; health >= 0; health--) {
            await page.waitForFunction(
                () =>
                    window.testScene.activeElapsed >=
                    window.armoredEnemy.getData("hitUntil"),
            );
            await page.evaluate(() => {
                const s = window.testScene;
                const enemy = window.armoredEnemy;
                s.player.body.reset(enemy.x, enemy.body.top - 38);
                s.player.setVelocityY(200);
            });
            if (health > 0) {
                await page.waitForFunction(
                    (remaining) =>
                        window.armoredEnemy.getData("health") === remaining,
                    health,
                );
                expect(
                    await page.evaluate(() => window.armoredEnemy.active),
                ).toBe(true);
            } else
                await page.waitForFunction(() => !window.armoredEnemy.active);
        }
        await expect(page.locator("#lives")).toHaveText("03");
        expect(Number(await page.locator("#score").textContent())).toBe(
            50 * levelIndex + 200 * (levelIndex + 1),
        );
    });

test("world three plants fire aimed projectiles and pause freezes hazards", async ({
    page,
}) => {
    await startWorld(page, 2);
    await page.evaluate(() => {
        const s = window.testScene;
        s.enemies
            .getChildren()
            .forEach((enemy) => enemy.disableBody(true, true));
        s.player.body.reset(600, 432);
        s.plants[0].elapsed = s.plants[0].settings.hidden;
    });
    await page.waitForFunction(
        () => window.testScene.projectiles.countActive() > 0,
    );
    await page.locator("#pause").click();
    const state = await page.evaluate(() => ({
        x: window.testScene.projectiles.getFirstAlive().x,
        y: window.testScene.projectiles.getFirstAlive().y,
        cycle: window.testScene.plants[0].elapsed,
    }));
    await page.waitForTimeout(350);
    expect(
        await page.evaluate(() => ({
            x: window.testScene.projectiles.getFirstAlive().x,
            y: window.testScene.projectiles.getFirstAlive().y,
            cycle: window.testScene.plants[0].elapsed,
        })),
    ).toEqual(state);
    await page.locator("#dialog-primary").click();
    await expect(page.locator("#lives")).toHaveText("02");
});

test("three distinct worlds preserve campaign progress and only the final flag wins", async ({
    page,
}, testInfo) => {
    await page.evaluate(() => {
        const s = window.testScene;
        s.addCoin();
        s.lives = 2;
        s.emitHud();
    });
    const enemyCounts = [];
    const speeds = [];
    const colors = [];
    for (let world = 1; world <= 3; world++) {
        const state = await page.evaluate(() => ({
            enemies: window.testScene.enemies.countActive(),
            plants: window.testScene.plants.length,
            speed: Math.max(
                ...window.testScene.level.enemies.map((enemy) => enemy.speed),
            ),
            color: window.testScene.cameras.main.backgroundColor.color,
        }));
        enemyCounts.push(state.enemies);
        speeds.push(state.speed);
        colors.push(state.color);
        expect(state.plants).toBe(world + 3);
        await expect(page.locator("#current-world-label")).toHaveText(
            `MUNDO ${world} / 3`,
        );
        await expect(page.locator("#coins")).toHaveText("01");
        await expect(page.locator("#lives")).toHaveText("02");
        await page.screenshot({
            path: testInfo.outputPath(`world-${world}.png`),
            fullPage: true,
        });
        await page.evaluate(() =>
            window.testScene.player.body.reset(4445, 410),
        );
        await expect(page.locator("#dialog-title")).toHaveText(
            world < 3 ? `Mundo ${world} completo!` : "Reino salvo, Mario!",
        );
        const score = await page.locator("#score").textContent();
        await page.locator("#dialog-primary").click();
        await expect(page.locator("#game-dialog")).not.toBeVisible();
        if (world < 3) {
            await page.waitForFunction(
                (index) =>
                    window.testScene.levelIndex === index &&
                    !window.testScene.ended,
                world,
            );
            await expect(page.locator("#score")).toHaveText(score);
        }
    }
    expect(enemyCounts).toEqual([6, 10, 14]);
    expect(speeds[1]).toBeGreaterThan(speeds[0]);
    expect(speeds[2]).toBeGreaterThan(speeds[1]);
    expect(new Set(colors).size).toBe(3);
    await expect(page.locator("#current-world-label")).toHaveText(
        "MUNDO 1 / 3",
    );
    await expect(page.locator("#score")).toHaveText("000000");
    await expect(page.locator("#coins")).toHaveText("00");
    await expect(page.locator("#lives")).toHaveText("03");
});

test("restarting a later world restores entry score without farming coins", async ({
    page,
}) => {
    await page.evaluate(() => {
        const s = window.testScene;
        s.scene.restart({ levelIndex: 1, score: 2000, coins: 5, lives: 2 });
    });
    await page.waitForFunction(
        () => window.testScene.levelIndex === 1 && !window.testScene.ended,
    );
    await page.evaluate(() => window.testScene.addCoin());
    await expect(page.locator("#coins")).toHaveText("06");
    await page.locator("#restart").click();
    await expect(page.locator("#score")).toHaveText("002000");
    await expect(page.locator("#coins")).toHaveText("05");
    await expect(page.locator("#lives")).toHaveText("03");
    await expect(page.locator("#current-world-label")).toHaveText(
        "MUNDO 2 / 3",
    );
    expect(
        await page.evaluate(() => window.testScene.projectiles.countActive()),
    ).toBe(0);
    expect(
        await page.evaluate(() =>
            window.testScene.plants.every((plant) => !plant.body.enable),
        ),
    ).toBe(true);
});

for (const levelIndex of [1, 2])
    test(`world ${levelIndex + 1} fits mobile and its first pit is traversable`, async ({
        page,
    }, testInfo) => {
        await startWorld(page, levelIndex);
        await page.setViewportSize({ width: 390, height: 844 });
        await page.screenshot({
            path: testInfo.outputPath(`mobile-world-${levelIndex + 1}.png`),
            fullPage: true,
        });
        expect(
            await page.evaluate(
                () => document.documentElement.scrollWidth <= innerWidth,
            ),
        ).toBe(true);
        await page.evaluate(() => {
            const s = window.testScene;
            s.player.body.reset(s.level.ground[0][1] - 40, 432);
        });
        await page.keyboard.down("ArrowRight");
        await page.keyboard.down("Space");
        await page.waitForFunction(
            () =>
                window.testScene.player.x >
                    window.testScene.level.ground[1][0] + 25 &&
                window.testScene.player.body.blocked.down,
        );
        await page.keyboard.up("ArrowRight");
        await page.keyboard.up("Space");
        await expect(page.locator("#lives")).toHaveText("03");
    });

test("mobile layout fits and touch movement works", async ({
    page,
}, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(150);
    await expect(page.locator(".touch-controls")).toBeVisible();
    const start = await page.evaluate(() => window.testScene.player.x);
    const bounds = await page.locator('[data-control="right"]').boundingBox();
    await page.mouse.move(
        bounds.x + bounds.width / 2,
        bounds.y + bounds.height / 2,
    );
    await page.mouse.down();
    await page.waitForFunction(
        (x) => window.testScene.player.x > x + 35,
        start,
    );
    await page.mouse.up();
    expect(
        await page.evaluate(() => window.testScene.player.x),
    ).toBeGreaterThan(start + 25);
    expect(
        await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
        ),
    ).toBe(true);
    const hudBounds = await page.locator(".hud").boundingBox();
    const canvasBounds = await page.locator("canvas").boundingBox();
    expect(hudBounds.x).toBeGreaterThanOrEqual(canvasBounds.x);
    expect(hudBounds.x + hudBounds.width).toBeLessThanOrEqual(
        canvasBounds.x + canvasBounds.width,
    );
    await page.screenshot({
        path: testInfo.outputPath("mobile.png"),
        fullPage: true,
    });
});

test("can cross a pit using normal movement and jump", async ({ page }) => {
    await page.evaluate(() => window.testScene.player.body.reset(1490, 432));
    await page.keyboard.down("ArrowRight");
    await page.keyboard.down("Space");
    await page.waitForFunction(
        () =>
            window.testScene.player.x > 1720 &&
            window.testScene.player.body.blocked.down,
    );
    await page.keyboard.up("ArrowRight");
    await page.keyboard.up("Space");
    await expect(page.locator("#lives")).toHaveText("03");
});

test("checkpoint respawn and keyboard-accessible pause work", async ({
    page,
}) => {
    await page.evaluate(() => window.testScene.player.body.reset(1770, 432));
    await page.waitForFunction(() => window.testScene.checkpoint === 1740);
    await page.evaluate(() => window.testScene.player.body.reset(1600, 630));
    await expect(page.locator("#lives")).toHaveText("02");
    await page.waitForFunction(() => !window.testScene.dying);
    expect(await page.evaluate(() => window.testScene.player.x)).toBe(1740);
    await page.keyboard.press("p");
    await page.locator("#dialog-primary").focus();
    await page.keyboard.press("Space");
    await expect(page.locator("#game-dialog")).not.toBeVisible();
    await expect(page.locator("#phaser-container")).toBeFocused();
});
