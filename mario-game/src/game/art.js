const PALETTE = {
    r: "#e74736",
    s: "#fac08b",
    b: "#644131",
    d: "#293e3e",
    u: "#367a91",
    y: "#fbd557",
    w: "#fff5db",
};
const MARIO = [
    ".....rrrrrr.....",
    "....rrrrrrrrr...",
    "....bbbssds.....",
    "...bsbsssdsss...",
    "...bsbbsssdsss..",
    "....bssssdddd...",
    ".....sssssss....",
    "....rrurrr......",
    "...rrrurrurr....",
    "..rrrruuuuurrr..",
    "..ssruyuuuyurs..",
    "..ssssuuuuusss..",
    "...ssuuuuuus....",
    "....uu..uuu.....",
    "...bbb..bbb.....",
    "..bbbb..bbbb....",
];

function sprite(scene, name, pixels, colors, step = 2) {
    const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
    pixels.forEach((row, y) =>
        [...row].forEach((pixel, x) => {
            if (colors[pixel])
                graphics
                    .fillStyle(parseInt(colors[pixel].slice(1), 16))
                    .fillRect(x * step, y * step, step, step);
        }),
    );
    graphics.generateTexture(
        name,
        Math.max(...pixels.map((row) => row.length)) * step,
        pixels.length * step,
    );
    graphics.destroy();
}

export function createArt(scene) {
    if (scene.textures.exists("mario-idle")) return;
    sprite(scene, "mario-idle", MARIO, PALETTE);
    const walk = [...MARIO];
    walk.splice(
        13,
        3,
        "...uuu..uuu.....",
        "..bbb....uu.....",
        ".bbbb....bbbb...",
    );
    sprite(scene, "mario-walk", walk, PALETTE);
    const jump = [...MARIO];
    jump.splice(
        13,
        3,
        "..uuuu..uuuu....",
        ".bbbb....bbb....",
        ".bbb......bbb...",
    );
    sprite(scene, "mario-jump", jump, PALETTE);
    sprite(
        scene,
        "goomba",
        [
            ".....bbbbbb.....",
            "...bbbbbbbbbb...",
            "..bbbbbbbbbbbb..",
            ".bbddbbbbddbbb..",
            ".bwwdbbbbdwwbb..",
            "bbwwdbbbbdwwbbb.",
            "bbbbbbbbbbbbbbb.",
            "bbbbbbbbbbbbbbb.",
            ".bbbbbbbbbbbbb..",
            "..sssssssssss...",
            "..sssssssssss...",
            ".dddssssssddd...",
            "dddddd..dddddd..",
            "ddddd....ddddd..",
        ],
        { b: "#a96943", d: "#3e3b32", w: "#fffbe9", s: "#e9bd83" },
    );

    const armored = [
        ".....hhhhhh.....",
        "...hhhhhhhhhh...",
        "..hhhhhhhhhhhh..",
        ".hhhhhhhhhhhhhh.",
        ".bwwdbbbbdwwbb..",
        "bbwwdbbbbdwwbbb.",
        "bbbbbbbbbbbbbbb.",
        "bbbbbbbbbbbbbbb.",
        ".bbbbbbbbbbbbb..",
        "..sssssssssss...",
        "..sssssssssss...",
        ".dddssssssddd...",
        "dddddd..dddddd..",
        "ddddd....ddddd..",
    ];
    sprite(scene, "goomba-armored", armored, {
        h: "#7196a0",
        b: "#457181",
        d: "#293f46",
        w: "#fffbe9",
        s: "#b9c9af",
    });
    sprite(scene, "goomba-elite", armored, {
        h: "#eee0ae",
        b: "#a54b49",
        d: "#483737",
        w: "#fffbe9",
        s: "#d99e7f",
    });

    const draw = (key, width, height, paint) => {
        const g = scene.make.graphics({ x: 0, y: 0 }, false);
        paint(g);
        g.generateTexture(key, width, height);
        g.destroy();
    };
    draw("ground", 48, 48, (g) => {
        g.fillStyle(0xb58158).fillRect(0, 0, 48, 48);
        g.fillStyle(0x749857).fillRect(0, 0, 48, 9);
        g.fillStyle(0x9abc6b).fillRect(0, 0, 48, 4);
        g.fillStyle(0x527648).fillRect(0, 9, 48, 3);
        g.fillStyle(0xc89b71).fillRect(2, 15, 19, 13).fillRect(26, 32, 19, 13);
        g.fillStyle(0x966b49).fillRect(23, 14, 2, 34).fillRect(0, 29, 48, 2);
        g.fillStyle(0xd7ad7c).fillRect(4, 17, 6, 3).fillRect(29, 34, 7, 3);
    });
    draw("dirt", 48, 48, (g) => {
        g.fillStyle(0xb58158).fillRect(0, 0, 48, 48);
        g.fillStyle(0xc89b71).fillRect(2, 3, 19, 20).fillRect(26, 27, 19, 18);
        g.fillStyle(0x966b49).fillRect(23, 0, 2, 48).fillRect(0, 24, 48, 2);
    });
    draw("brick", 48, 48, (g) => {
        g.fillStyle(0x7e5542).fillRect(0, 0, 48, 48);
        g.fillStyle(0xc18a64)
            .fillRect(2, 2, 44, 20)
            .fillRect(2, 25, 20, 20)
            .fillRect(25, 25, 21, 20);
        g.fillStyle(0xe0b083)
            .fillRect(3, 3, 42, 3)
            .fillRect(3, 26, 18, 3)
            .fillRect(26, 26, 18, 3);
    });
    draw("question", 48, 48, (g) => {
        g.fillStyle(0xb37b2c).fillRect(0, 0, 48, 48);
        g.fillStyle(0xf3c65b).fillRect(2, 2, 44, 42);
        g.fillStyle(0xffe290).fillRect(4, 4, 38, 4).fillRect(4, 4, 4, 34);
        g.fillStyle(0xb37b2c)
            .fillRect(5, 5, 3, 3)
            .fillRect(40, 5, 3, 3)
            .fillRect(5, 38, 3, 3)
            .fillRect(40, 38, 3, 3);
        g.fillStyle(0x95672d)
            .fillRect(15, 12, 18, 5)
            .fillRect(27, 16, 6, 9)
            .fillRect(21, 23, 8, 7)
            .fillRect(21, 34, 6, 6);
    });
    draw("used", 48, 48, (g) => {
        g.fillStyle(0x9a8e64).fillRect(0, 0, 48, 48);
        g.fillStyle(0xb3a77c).fillRect(3, 3, 42, 41);
        g.fillStyle(0x8b8059)
            .fillRect(6, 6, 4, 4)
            .fillRect(38, 6, 4, 4)
            .fillRect(6, 35, 4, 4)
            .fillRect(38, 35, 4, 4);
    });
    draw("coin", 20, 28, (g) => {
        g.fillStyle(0xb98d30).fillRect(4, 0, 12, 28).fillRect(0, 5, 20, 18);
        g.fillStyle(0xf8d05b).fillRect(4, 3, 12, 22);
        g.fillStyle(0xffe9a1).fillRect(5, 4, 4, 18);
        g.fillStyle(0xd9a840).fillRect(12, 7, 3, 14);
    });
    draw("pipe", 80, 128, (g) => {
        g.fillStyle(0x3f7452).fillRect(8, 0, 64, 128);
        g.fillStyle(0x73a965).fillRect(12, 0, 56, 128);
        g.fillStyle(0x9ac779).fillRect(16, 0, 9, 128);
        g.fillStyle(0x568952).fillRect(57, 0, 9, 128);
        g.fillStyle(0x376648).fillRect(0, 0, 80, 25);
        g.fillStyle(0x84b774).fillRect(3, 3, 74, 18);
        g.fillStyle(0xb1d68c).fillRect(5, 4, 70, 4);
        g.fillStyle(0x426f4b).fillRect(68, 8, 8, 12);
    });
    for (const open of [false, true])
        draw(open ? "piranha-open" : "piranha-closed", 48, 80, (g) => {
            g.fillStyle(0x376e43).fillRect(21, 23, 7, 57);
            g.fillStyle(0x82b85d).fillRect(22, 28, 3, 52);
            g.fillStyle(0x4e934d)
                .fillRect(7, 51, 16, 8)
                .fillRect(25, 42, 16, 8)
                .fillRect(11, 59, 12, 6)
                .fillRect(29, 50, 8, 5);
            g.fillStyle(0x94c76e)
                .fillRect(9, 51, 13, 3)
                .fillRect(28, 42, 12, 3);
            g.fillStyle(0x963f38)
                .fillRect(8, 4, 32, 24)
                .fillRect(4, 10, 40, 13);
            g.fillStyle(0xe45342).fillRect(9, 3, 28, 20).fillRect(5, 9, 36, 12);
            g.fillStyle(0xffe8bd)
                .fillRect(12, 6, 6, 6)
                .fillRect(27, 7, 6, 5)
                .fillRect(10, 18, 5, 5);
            if (open) {
                g.fillStyle(0x3d4031).fillRect(21, 14, 22, 10);
                g.fillStyle(0xfff4d9)
                    .fillRect(20, 12, 24, 3)
                    .fillRect(21, 23, 22, 3)
                    .fillRect(25, 15, 3, 3)
                    .fillRect(34, 15, 3, 3)
                    .fillRect(29, 20, 3, 3)
                    .fillRect(39, 20, 3, 3);
            } else g.fillStyle(0xfff4d9).fillRect(20, 20, 23, 4);
        });
    draw("fireball", 18, 18, (g) => {
        g.fillStyle(0xc94632).fillRect(3, 0, 12, 18).fillRect(0, 3, 18, 12);
        g.fillStyle(0xf6963e).fillRect(3, 3, 12, 12);
        g.fillStyle(0xffe6a0).fillRect(6, 5, 7, 8);
    });
    for (const surface of [true, false])
        draw(surface ? "stone-ground" : "stone-dirt", 48, 48, (g) => {
            g.fillStyle(0x66656c).fillRect(0, 0, 48, 48);
            g.fillStyle(0x8a8585)
                .fillRect(2, 3, 21, 19)
                .fillRect(26, 25, 20, 20);
            g.fillStyle(0xaaa09a).fillRect(4, 4, 16, 3).fillRect(28, 27, 15, 3);
            g.fillStyle(0x484c56).fillRect(0, 23, 48, 2).fillRect(24, 0, 2, 48);
            if (surface) g.fillStyle(0xbbb0a1).fillRect(0, 0, 48, 4);
        });
    draw("cloud", 160, 64, (g) => {
        g.fillStyle(0xeaf5e9)
            .fillRect(12, 28, 136, 30)
            .fillRect(28, 12, 40, 40)
            .fillRect(68, 0, 42, 50)
            .fillRect(108, 18, 30, 30);
        g.fillStyle(0xf8fcf1)
            .fillRect(15, 25, 125, 24)
            .fillRect(32, 9, 34, 32)
            .fillRect(72, 0, 34, 43);
        g.fillStyle(0xd7e9db).fillRect(24, 52, 112, 6);
    });
    draw("bush", 120, 48, (g) => {
        g.fillStyle(0x82ad73)
            .fillRect(0, 28, 120, 20)
            .fillRect(12, 14, 34, 30)
            .fillRect(40, 0, 42, 44)
            .fillRect(78, 20, 30, 28);
        g.fillStyle(0xa1c584)
            .fillRect(18, 15, 18, 6)
            .fillRect(46, 2, 28, 6)
            .fillRect(84, 22, 16, 6);
        g.fillStyle(0x68965f).fillRect(0, 40, 120, 8);
    });
}
