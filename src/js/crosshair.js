export default function crosshair({
  ctx,
  x,
  y,
  size = 2,
  strokeStyle = "red",
}) {
  ctx.save();

  ctx.strokeStyle = strokeStyle;

  ctx.beginPath();
  ctx.moveTo(x - size, y - size);
  ctx.lineTo(x + size, y + size);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + size, y - size);
  ctx.lineTo(x - size, y + size);
  ctx.stroke();

  ctx.restore();
}
