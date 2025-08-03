import "phaser";

function loadSprite(scene: Phaser.Scene, name: string, skipCollision = false) {
  scene.load.aseprite(name, `sprite_${name}.png`, `sprite_${name}.json`);
  if (!skipCollision) scene.load.json(`${name}_collision`, `sprite_${name}-collision.json`);
}

export function preloadAssets(scene: Phaser.Scene) {
  scene.load.path = "assets/";

  // Physical sprites:
  [
    "rocket",
    "rocket_omin",
    "island_cacti",
    "island_cave",
    "island_doom",
    "island_ireland",
    "island_lake",
    "island_sign",
    "island_skull",
    "island_stock",
    "shop_red",
    "shop_blue",
    "flag_green",
    "shop_stock",
  ].forEach(name => loadSprite(scene, name));

  // Decoration sprites:
  ["effect_explosion", "icon_cactus", "icon_lava", "icon_water"].forEach(name => loadSprite(scene, name, true));

  // Static images:
  [
    "watch_arrow",
    "watch_body",
    "ui",
    "particle_smoke",
    "background_1",
    "background_2",
    "background_3",
  ].forEach(name => {
    scene.load.image(name, `sprite_${name}.png`);
  });
}

// Stuff that can't happen in preload.
export function prepareAssets(scene: Phaser.Scene) {
  // Manually slice out parts of the image (could probably be done better with an atlas).
  const uiTexture = scene.textures.get("ui");
  uiTexture.add("ui_panel_frame", 0, 0, 0, 32, 32);
}
