// Tooltip.jsx — hover card
const Tooltip = ({ node, pos }) => {
  if (!node) return null;
  return (
    <div className="ns-tooltip" style={{ left: pos.x + 14, top: pos.y + 14 }}>
      <div className="ns-tt-type" style={{ color: node.color }}>{node.typeLabel}</div>
      <div className="ns-tt-title">{node.label}</div>
      <div className="ns-tt-desc">{node.description}</div>
    </div>
  );
};

window.Tooltip = Tooltip;
