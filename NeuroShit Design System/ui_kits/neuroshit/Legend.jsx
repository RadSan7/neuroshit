// Legend.jsx — bottom-right node + edge key
const Legend = () => {
  const [open, setOpen] = React.useState(true);
  return (
    <aside className="ns-legend">
      <header className="ns-legend-header" onClick={() => setOpen(o => !o)}>
        <h3>Legenda</h3>
        <span className="ns-legend-chev">{open ? '▾' : '▸'}</span>
      </header>
      {open && (
        <div className="ns-legend-body">
          <div className="ns-legend-col">
            <div className="ns-legend-sec">Węzły</div>
            <div className="ns-legend-item"><span className="ns-shape ns-circle" style={{ background:'#4ade80', color:'#4ade80' }}></span>Neuroprzekaźnik</div>
            <div className="ns-legend-item"><span className="ns-shape ns-pill" style={{ background:'#60a5fa' }}>E</span>Enzym syntezy</div>
            <div className="ns-legend-item"><span className="ns-shape ns-pill" style={{ background:'#f87171' }}>E</span>Enzym degradacji</div>
            <div className="ns-legend-item"><span className="ns-shape ns-hex" style={{ background:'#c084fc' }}></span>Receptor</div>
            <div className="ns-legend-item"><span className="ns-shape ns-dia" style={{ background:'#22d3ee' }}></span>Transporter</div>
            <div className="ns-legend-item"><span className="ns-shape ns-circ-sm" style={{ background:'#f59e0b', color:'#f59e0b' }}></span>Prekursor</div>
            <div className="ns-legend-item"><span className="ns-shape ns-circ-sm" style={{ background:'#94a3b8' }}></span>Metabolit</div>
          </div>
          <div className="ns-legend-col">
            <div className="ns-legend-sec">Połączenia</div>
            <div className="ns-legend-item"><span className="ns-line ns-l-syn"></span>Synteza</div>
            <div className="ns-legend-item"><span className="ns-line ns-l-deg"></span>Degradacja</div>
            <div className="ns-legend-item"><span className="ns-line ns-l-reu"></span>Wychwyt zwrotny</div>
            <div className="ns-legend-item"><span className="ns-line ns-l-con"></span>Konwersja prekursora</div>
          </div>
        </div>
      )}
    </aside>
  );
};

window.Legend = Legend;
