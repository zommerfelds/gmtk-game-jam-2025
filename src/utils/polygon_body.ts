// Use this tool to create shape JSONs: https://gemini.google.com/share/713af5bc71c2

export function setPolygonBody(
  sprite: Phaser.Physics.Matter.Image | Phaser.Physics.Matter.Sprite,
  collisionJson: any,
) {
  if (!collisionJson?.polygons) return;

  const polygons = (collisionJson.polygons as any[]).filter(p => p.name !== "spawn");
  if (!polygons.length) return;

  const MatterLib = (Phaser.Physics.Matter as any).Matter;
  const Bodies = MatterLib.Bodies;
  const Body = MatterLib.Body;
  const parts: any[] = [];

  polygons.forEach(poly => {
    const part = Bodies.fromVertices(sprite.x, sprite.y, poly.points, {}, true);
    if (part) parts.push(part);
  });

  if (!parts.length) return;

  const body = parts.length === 1 ? parts[0] : Body.create({ parts });
  sprite.setExistingBody(body);
}

export function getSpawnPoint(collisionJson: any) {
  if (!collisionJson?.polygons) {
    throw new Error("collisionJson has no polygons");
  }
  const spawnPoly = (collisionJson.polygons as any[]).find((p: any) => p.name === "spawn");
  if (!spawnPoly?.points?.length) {
    throw new Error("spawn polygon not found or has no points");
  }
  const { x, y } = spawnPoly.points[0];
  return { x, y };
}
