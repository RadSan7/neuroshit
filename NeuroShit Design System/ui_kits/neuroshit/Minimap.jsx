// Minimap.jsx — bottom-left overview with viewport rectangle
const Minimap = ({ nodes, camera, bounds }) => {
  const w = 220, h = 165;
  if (!bounds) return <div className="ns-minimap"></div>;
  const { minX, minY, maxX, maxY } = bounds;
  const sx = (w - 20) / (maxX - minX || 1);
  const sy = (h - 20) / (maxY - minY || 1);
  const s = Math.min(sx, sy);
  const offX = (w - (maxX - minX) * s) / 2 - minX * s;
  const offY = (h - (maxY - minY) * s) / 2 - minY * s;

  // viewport rect approximation
  const vp = {
    left: Math.max(0, Math.min(w, offX + (camera.x - 400 / camera.scale) * s)) ,
    top: Math.max(0, Math.min(h, offY + (camera.y - 300 / camera.scale) * s)),
    width: Math.min(w, (800 / camera.scale) * s),
    height: Math.min(h, (600 / camera.scale) * s),
  };

  return (
    <div className="ns-minimap">
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
        {nodes.map(n => (
          <circle key={n.id} cx={offX + n.x * s} cy={offY + n.y * s} r="2.5" fill={n.color} opacity="0.9"/>
        ))}
      </svg>
      <div className="ns-mm-vp" style={{ left: vp.left, top: vp.top, width: Math.max(20, vp.width), height: Math.max(20, vp.height) }}></div>
    </div>
  );
};

window.Minimap = Minimap;
