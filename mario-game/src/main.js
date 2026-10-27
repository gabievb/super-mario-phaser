import Phaser from "phaser";
import {
    createIcons,
    ArrowUpRight,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    Volume2,
    VolumeX,
    RotateCcw,
    Pause,
    Play,
    Maximize,
    Minimize,
    Timer,
} from "lucide";
import { PlatformScene } from "./scenes/PlatformScene.js";

const icons = {
    ArrowUpRight,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    Volume2,
    VolumeX,
    RotateCcw,
    Pause,
    Play,
    Maximize,
    Minimize,
    Timer,
};
const renderIcons = () => createIcons({ icons });
const buttonIcon = (button, name) => {
    button.innerHTML = `<i data-lucide="${name}"></i>`;
    renderIcons();
};
const byId = (id) => document.getElementById(id);
const touch = { left: false, right: false, jump: false };
const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: "phaser-container",
    width: 960,
    height: 540,
    backgroundColor: "#c5e8dd",
    pixelArt: true,
    roundPixels: true,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: {
        default: "arcade",
        arcade: { gravity: { y: 1450 }, debug: false },
    },
    scene: [PlatformScene],
    callbacks: { preBoot: (instance) => instance.registry.set("touch", touch) },
});

// Inspect the running scene in development without booting a second game.
if (import.meta.env.DEV) window.__MARIO_GAME__ = game;

const scene = () => game.scene.getScene("PlatformScene");
const dialog = byId("game-dialog");
let dialogMode = "pause";

function closeDialog() {
    if (dialog.open) {
        dialog.close();
        byId("phaser-container").focus({ preventScroll: true });
    }
}
function restart() {
    closeDialog();
    scene().restartLevel();
}
function togglePause() {
    if (!scene()?.player || scene().ended) return;
    scene().setPaused(!scene().paused);
}

game.events.on("hud", ({ score, coins, lives, time }) => {
    for (const [id, value] of Object.entries({
        score: String(score).padStart(6, "0"),
        coins: String(coins).padStart(2, "0"),
        lives: String(lives).padStart(2, "0"),
        time: String(time).padStart(3, "0"),
    }))
        byId(id).textContent = value;
    byId("time").style.color = time < 30 ? "#bd3029" : "";
});

function showDialog(mode, title, detail) {
    dialogMode = mode;
    byId("dialog-title").textContent = title;
    byId("dialog-detail").textContent = detail;
    byId("dialog-eyebrow").textContent =
        mode === "pause"
            ? "INTERVALO"
            : mode === "win"
              ? "CAMPANHA COMPLETA"
              : mode === "next"
                ? "PROXIMA AVENTURA"
                : "FIM DE JOGO";
    byId("dialog-primary").querySelector("span").textContent =
        mode === "pause"
            ? "Continuar"
            : mode === "next"
              ? "Proximo mundo"
              : mode === "lose"
                ? "Tentar novamente"
                : "Jogar novamente";
    byId("dialog-restart").hidden = mode !== "pause";
    if (!dialog.open) dialog.showModal();
    byId("announcement").textContent = title;
}

game.events.on("pausechange", (paused) => {
    byId("game-status").textContent = paused ? "PAUSADO" : "EM JOGO";
    byId("pause").setAttribute(
        "aria-label",
        paused ? "Continuar jogo" : "Pausar jogo",
    );
    byId("pause").title = paused ? "Continuar jogo" : "Pausar jogo";
    buttonIcon(byId("pause"), paused ? "play" : "pause");
    if (paused)
        showDialog("pause", "Jogo pausado", "A aventura continua daqui.");
    else closeDialog();
});
game.events.on("finish", ({ won, score, coins, world, hasNext }) => {
    byId("game-status").textContent = won
        ? hasNext
            ? "MUNDO COMPLETO"
            : "REINO SALVO"
        : "FIM DE JOGO";
    byId("footer-status").textContent = won
        ? hasNext
            ? "Uma nova aventura espera por voce."
            : "Tres mundos. Uma grande aventura!"
        : "Uma nova chance esta a um salto.";
    showDialog(
        won ? (hasNext ? "next" : "win") : "lose",
        won
            ? hasNext
                ? `Mundo ${world} completo!`
                : "Reino salvo, Mario!"
            : "Vamos de novo?",
        `${String(score).padStart(6, "0")} pontos e ${coins} moedas nesta aventura.`,
    );
});
game.events.on("newgame", ({ world, totalWorlds, name, description }) => {
    document.querySelector(".game").dataset.world = String(world);
    document.querySelector(".level-name").textContent = name.toUpperCase();
    byId("current-world-label").textContent = `MUNDO ${world} / ${totalWorlds}`;
    document.querySelector(".world-tag").textContent = `${world} - 1`;
    document.querySelector(".chapter-number").textContent = String(
        world,
    ).padStart(2, "0");
    document.querySelector(".chapter h2").textContent = name;
    document.querySelector(".chapter p").textContent = description;
    document.querySelectorAll("[data-world-step]").forEach((step) => {
        step.classList.toggle(
            "world-reached",
            Number(step.dataset.worldStep) <= world,
        );
    });
    byId("game-status").textContent = "EM JOGO";
    byId("footer-status").textContent = "A aventura esta so comecando.";
    byId("pause").setAttribute("aria-label", "Pausar jogo");
    byId("pause").title = "Pausar jogo";
    buttonIcon(byId("pause"), "pause");
});
game.events.on("life", (lives) => {
    byId("announcement").textContent = `Restam ${lives} vidas.`;
});

byId("pause").addEventListener("click", togglePause);
byId("restart").addEventListener("click", restart);
byId("dialog-primary").addEventListener("click", () => {
    if (dialogMode === "pause") scene().setPaused(false);
    else if (dialogMode === "next") {
        closeDialog();
        scene().advanceLevel();
    } else if (dialogMode === "win") {
        closeDialog();
        scene().restartCampaign();
    } else restart();
});
byId("dialog-restart").addEventListener("click", restart);
dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    if (dialogMode === "pause") scene().setPaused(false);
});
byId("sound").addEventListener("click", () => {
    const muted = !game.registry.get("muted");
    game.registry.set("muted", muted);
    byId("sound").setAttribute("aria-pressed", String(!muted));
    byId("sound").setAttribute(
        "aria-label",
        muted ? "Ativar som" : "Desativar som",
    );
    byId("sound").title = muted ? "Ativar som" : "Desativar som";
    buttonIcon(byId("sound"), muted ? "volume-x" : "volume-2");
});
byId("fullscreen").addEventListener("click", async () => {
    try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else await document.querySelector(".game").requestFullscreen();
    } catch {
        byId("announcement").textContent =
            "Tela cheia indisponivel neste navegador.";
    }
});
document.addEventListener("fullscreenchange", () => {
    const active = Boolean(document.fullscreenElement);
    buttonIcon(byId("fullscreen"), active ? "minimize" : "maximize");
    byId("fullscreen").setAttribute(
        "aria-label",
        active ? "Sair da tela cheia" : "Tela cheia",
    );
    byId("fullscreen").title = active ? "Sair da tela cheia" : "Tela cheia";
});
document.addEventListener("keydown", (event) => {
    if (event.repeat || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName))
        return;
    if (event.code === "KeyP" || (event.code === "Escape" && !dialog.open)) {
        event.preventDefault();
        togglePause();
    }
    if (event.code === "KeyR" && !dialog.open) restart();
});
function clearTouch() {
    Object.keys(touch).forEach((key) => {
        touch[key] = false;
    });
    document
        .querySelectorAll(".pressed")
        .forEach((el) => el.classList.remove("pressed"));
}
for (const button of document.querySelectorAll("[data-control]")) {
    button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        button.setPointerCapture(event.pointerId);
        touch[button.dataset.control] = true;
        button.classList.add("pressed");
    });
    for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
        button.addEventListener(type, () => {
            touch[button.dataset.control] = false;
            button.classList.remove("pressed");
        });
}
game.events.on("blur", () => {
    clearTouch();
    if (scene()?.player && !scene().ended) scene().setPaused(true);
});
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        clearTouch();
        if (scene()?.player && !scene().ended) scene().setPaused(true);
    }
});
renderIcons();
