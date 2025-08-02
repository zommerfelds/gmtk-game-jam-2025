// Use this tool to create shape JSONs: https://gemini.google.com/share/713af5bc71c2

const POLYGON_NAME_LANDING_LINE = "landing";

export function setPolygonBody(
  sprite: Phaser.Physics.Matter.Image | Phaser.Physics.Matter.Sprite,
  collisionJson: any,
) {
  if (!collisionJson?.polygons) return;

  const polygons = (collisionJson.polygons as any[]).filter(
    p => p.name !== POLYGON_NAME_LANDING_LINE,
  );
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

export function getLandingLine(collisionJson: any): Array<Phaser.Math.Vector2> {
  if (!collisionJson?.polygons) {
    throw new Error("collisionJson has no polygons");
  }
  const spawnPoly = (collisionJson.polygons as any[]).find(
    (p: any) => p.name === POLYGON_NAME_LANDING_LINE,
  );
  if (spawnPoly?.points?.length !== 2) {
    throw new Error("landing polygon not found or doesn't have two points");
  }
  const { x: x0, y: y0 } = spawnPoly.points[0];
  const { x: x1, y: y1 } = spawnPoly.points[1];
  return [new Phaser.Math.Vector2(x0, y0), new Phaser.Math.Vector2(x1, y1)];
}
