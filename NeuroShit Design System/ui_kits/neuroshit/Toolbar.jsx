// Toolbar.jsx — top chrome
const Toolbar = ({ zoom, onZoomIn, onZoomOut, onReset, systems, onToggleSystem, interactions, onToggleInteractions }) => {
  const [openFilter, setOpenFilter] = React.useState(false);
  return (
    <header className="ns-toolbar">
      <div className="ns-brand">NeuroShit</div>
      <span className="ns-subtitle">Neuro · Atlas Biochemiczny</span>

      <div className="ns-filter-wrap" style={{ marginLeft: 'auto', position: 'relative' }}>
        <button className="ns-filter-toggle" onClick={() => setOpenFilter(o => !o)}>Systemy</button>
        {openFilter && (
          <div className="ns-filter-dropdown">
            {systems.map(s => (
              <label key={s.id} className="ns-filter-item" onClick={e => { if (e.target.tagName !== 'INPUT') e.preventDefault(); }}>
                <input type="checkbox" checked={s.active} onChange={() => onToggleSystem(s.id)} />
                <span className="ns-filter-dot" style={{ background: s.color, color: s.color }}></span>
                <span>{s.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <button className={`ns-filter-toggle ${interactions ? 'active' : ''}`} onClick={onToggleInteractions}>Interakcje</button>

      <div className="ns-ctrl-group">
        <button className="ns-ibtn" onClick={onZoomOut} title="Oddal (−)">−</button>
        <span className="ns-zoom">{Math.round(zoom * 100)}%</span>
        <button className="ns-ibtn" onClick={onZoomIn} title="Przybliż (+)">+</button>
        <button className="ns-ibtn" onClick={onReset} title="Reset (0)">⌂</button>
      </div>
    </header>
  );
};

window.Toolbar = Toolbar;
