// InfoPanel.jsx — right-docked detail panel
const InfoPanel = ({ node, onClose }) => {
  const open = !!node;
  return (
    <div className={`ns-info-panel ${open ? '' : 'ns-hidden'}`}>
      <button className="ns-close" onClick={onClose} aria-label="Zamknij">×</button>
      {node && (
        <>
          <div className="ns-info-overline" style={{ color: node.color }}>{node.typeLabel}</div>
          <h2 className="ns-info-title">{node.label}</h2>
          {node.formula && (
            <div className="ns-info-section">
              <h3>Wzór sumaryczny</h3>
              <p style={{ fontFamily: "'Fira Code', monospace" }}>{node.formula}</p>
            </div>
          )}
          <div className="ns-info-section">
            <h3>Opis</h3>
            <p>{node.description}</p>
          </div>
          {node.gProtein && (
            <div className="ns-info-section">
              <h3>Białko G · Sygnalizacja</h3>
              <p>
                <span className="ns-tag" style={{ background: node.color, color: '#0a0a1a' }}>{node.gProtein}</span>
                {node.signaling && <span className="ns-tag ns-tag-outline">{node.signaling}</span>}
              </p>
            </div>
          )}
          {node.functions && (
            <div className="ns-info-section">
              <h3>Funkcje</h3>
              <p>{node.functions.join(' · ')}</p>
            </div>
          )}
          {node.ligands && (
            <div className="ns-info-section">
              <h3>Ligandy naturalne</h3>
              <p>{node.ligands.map((l, i) => <span key={i} className="ns-tag ns-tag-outline">{l}</span>)}</p>
            </div>
          )}
          {node.agonists && (
            <div className="ns-info-section">
              <h3>Agoniści farmakologiczni</h3>
              <p>{node.agonists.map((l, i) => <span key={i} className="ns-tag" style={{ background:'rgba(74,222,128,0.18)', color:'#4ade80', border:'1px solid rgba(74,222,128,0.35)' }}>{l}</span>)}</p>
            </div>
          )}
          {node.antagonists && (
            <div className="ns-info-section">
              <h3>Antagoniści</h3>
              <p>{node.antagonists.map((l, i) => <span key={i} className="ns-tag" style={{ background:'rgba(248,113,113,0.18)', color:'#f87171', border:'1px solid rgba(248,113,113,0.35)' }}>{l}</span>)}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

window.InfoPanel = InfoPanel;
