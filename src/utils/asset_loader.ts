import "phaser";

function loadSprite(scene: Phaser.Scene, name: string, skipCollision = false) {
  scene.load.aseprite(name, `sprite_${name}.png`, `sprite_${name}.json`);
  if (!skipCollision) scene.load.json(`${name}_collision`, `sprite_${name}-collision.json`);
}

export function preloadAssets(scene: Phaser.Scene) {
  scene.load.path = "assets/";

  [
    "rocket",
    "island_cacti",
    "island_cave",
    "island_doom",
    "island_ireland",
    "island_lake",
    "island_skull",
  ].forEach(name => loadSprite(scene, name));

  ["effect_explosion", "icon_cactus", "icon_lava"].forEach(name => loadSprite(scene, name, true));
}
