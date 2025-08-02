export function distancePointToSegment(
  point: Phaser.Math.Vector2,
  a: Phaser.Math.Vector2,
  b: Phaser.Math.Vector2,
): number {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const apx = point.x - a.x;
  const apy = point.y - a.y;
  const abLenSq = abx * abx + aby * aby;
  let t = 0;
  if (abLenSq !== 0) {
    t = (apx * abx + apy * aby) / abLenSq;
  }
  t = Phaser.Math.Clamp(t, 0, 1);
  const closestX = a.x + t * abx;
  const closestY = a.y + t * aby;
  return Phaser.Math.Distance.Between(point.x, point.y, closestX, closestY);
}
