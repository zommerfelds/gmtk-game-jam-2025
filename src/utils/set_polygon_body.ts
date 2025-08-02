export default function setPolygonBody(
  sprite: Phaser.Physics.Matter.Components.SetBody &
    Phaser.Physics.Matter.Components.Static &
    Phaser.Physics.Matter.Components.Transform,
  collisionJson: any
) {
  if (!collisionJson?.polygons) return;

  const polygons = (collisionJson.polygons as any[]).filter(
    (p) => p.name !== "spawn"
  );
  if (!polygons.length) return;

  const MatterLib = (Phaser.Physics.Matter as any).Matter;
  const Bodies = MatterLib.Bodies;
  const Body = MatterLib.Body;
  const parts: any[] = [];

  polygons.forEach((poly) => {
    const part = Bodies.fromVertices(
      sprite.x,
      sprite.y,
      poly.points,
      { isStatic: true },
      true
    );
    if (part) parts.push(part);
  });

  if (!parts.length) return;

  const body =
    parts.length === 1 ? parts[0] : Body.create({ parts, isStatic: true });
  sprite.setExistingBody(body);
  sprite.setStatic(true);
}
