import "phaser";

export function createBackgroundLayer(
  scene: Phaser.Scene,
  textureKey: string,
  scrollFactor: number,
  alpha: number,
  scale: number,
) {
  // Note: tileSprite would be more efficient and unlimited in size, but can't rotate/flip tiles randomly.
  const texture = scene.textures.get(textureKey);
  const tileSize = texture.getSourceImage().width;
  const RANGE = tileSize * 10;

  const container = scene.add
    .container(0, 0)
    .setScrollFactor(scrollFactor)
    .setAlpha(alpha)
    .setDepth(-100)
    .setScale(scale);

  for (let x = -RANGE; x < RANGE; x += tileSize) {
    for (let y = -RANGE; y < RANGE; y += tileSize) {
      const tile = scene.add.image(x, y, textureKey).setOrigin(0);
      tile.setFlipX(Math.random() < 0.5);
      tile.setFlipY(Math.random() < 0.5);
      tile.setAngle(90 * Phaser.Math.Between(0, 3));
      container.add(tile);
    }
  }
}

export function createBackground(scene: Phaser.Scene, textureKey: string) {
  createBackgroundLayer(scene, textureKey, 0.1, 0.1, 0.5);
  createBackgroundLayer(scene, textureKey, 0.2, 0.3, 0.5);
  createBackgroundLayer(scene, textureKey, 0.3, 0.5, 0.5);
}
