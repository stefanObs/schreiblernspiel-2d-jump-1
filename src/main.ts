import "./styles.css";
import Phaser from "phaser";
import { BachbrueckeScene } from "./game/BachbrueckeScene";

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: 1280,
  height: 720,
  backgroundColor: "#4DA3FF",
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: {
    default: "arcade",
    arcade: { gravity: { x: 0, y: 980 }, debug: false },
  },
  scene: [BachbrueckeScene],
});
