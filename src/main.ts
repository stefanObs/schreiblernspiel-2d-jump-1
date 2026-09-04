import "./styles.css";
import Phaser from "phaser";
import { installAppChrome } from "./appChrome";
import { BachbrueckeScene } from "./game/BachbrueckeScene";

installAppChrome();

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: 1920,
  height: 1080,
  backgroundColor: "#4DA3FF",
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: false,
  },
  physics: {
    default: "arcade",
    arcade: { gravity: { x: 0, y: 1470 }, debug: false },
  },
  scene: [BachbrueckeScene],
});
