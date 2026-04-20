// AtlasCanvas.jsx — canvas-rendered biochemical graph (cosmetic subset)
const { useEffect, useRef, useState } = React;

// Subset of nodes from the dopamine + serotonin + noradrenaline systems
const NODES = [
  // Dopamine
  { id:'DA_Tyr', type:'precursor', label:'Tyrozyna', x:80, y:200, formula:'C₉H₁₁NO₃', description:'Aminokwas — bezpośredni prekursor syntezy katecholamin.', sys:'dopamine' },
  { id:'DA_TH', type:'syntheticEnzyme', label:'TH', fullLabel:'TH (Hydroksylaza tyrozyny)', x:230, y:200, description:'Hydroksylaza tyrozynowa — etap limitujący syntezę katecholamin. Tyr→L-DOPA. Kofaktor: BH4, Fe²⁺, O₂.', sys:'dopamine' },
  { id:'DA_LDOPA', type:'precursor', label:'L-DOPA', x:380, y:200, formula:'C₉H₁₁NO₄', description:'L-3,4-dihydroksyfenyloalanina. Prekursor dopaminy. Stosowana w chorobie Parkinsona.', sys:'dopamine' },
  { id:'AADC', type:'syntheticEnzyme', label:'AADC', fullLabel:'AADC (Dekarboksylaza aminokwasów arom.)', x:530, y:200, description:'Dekarboksylaza L-aminokwasów aromatycznych. Katalizuje L-DOPA→dopamina oraz 5-HTP→serotonina. Kofaktor: pirydoksal (B6).', sys:'dopamine' },
  { id:'DA', type:'neurotransmitter', label:'Dopamina', x:700, y:200, formula:'C₈H₁₁NO₂', description:'Katecholamina. Kluczowa rola w: nagroda i motywacja, funkcje wykonawcze, kontrola ruchowa, regulacja prolaktyny.', sys:'dopamine' },
  { id:'DA_D1', type:'receptor', label:'D₁', x:870, y:100, description:'Receptor D1. D1-like (Gs). ↑cAMP. Pamięć robocza, nagroda.', gProtein:'Gs/Golf', signaling:'↑cAMP → PKA', functions:['Pamięć robocza','Nagroda','Lokomocja'], ligands:['Dopamina'], agonists:['SKF-81297','Fenoldopam'], antagonists:['SCH-23390','Ecopipam'], sys:'dopamine' },
  { id:'DA_D2', type:'receptor', label:'D₂', x:870, y:200, description:'Receptor D2. D2-like (Gi/Go). ↓cAMP. Cel leków przeciwpsychotycznych.', gProtein:'Gi/Go', signaling:'↓cAMP, ↑K⁺, ↓Ca²⁺', functions:['Kontrola ruchowa','Hamowanie prolaktyny','Nagroda','Autoreceptor'], ligands:['Dopamina'], agonists:['Bromokryptyna','Pramipeksol','Ropinirol'], antagonists:['Haloperidol','Olanzapina','Risperidon','Aripiprazol'], sys:'dopamine' },
  { id:'DA_D3', type:'receptor', label:'D₃', x:870, y:300, description:'Receptor D3. D2-like. Jądro półleżące. Rola w uzależnieniach.', gProtein:'Gi/Go', signaling:'↓cAMP', functions:['Uzależnienia','Nastrój','Poznanie'], ligands:['Dopamina'], agonists:['Pramipeksol','Rotigotyna'], antagonists:['Buspiron (słaby)'], sys:'dopamine' },
  { id:'DAT', type:'transporter', label:'DAT', x:700, y:330, description:'Transporter dopaminy (SLC6A3). Cel: kokaina, amfetamina, metylfenidat.', sys:'dopamine' },
  { id:'MAO-A', type:'catabolicEnzyme', label:'MAO-A', x:700, y:60, description:'Monoaminooksydaza A. Główny enzym degradacji serotoniny, noradrenaliny i dopaminy. Hamowany przez moklobemid.', sys:'shared' },

  // Serotonin (left side)
  { id:'5HT_Trp', type:'precursor', label:'Tryptofan', x:80, y:430, formula:'C₁₁H₁₂N₂O₂', description:'Aminokwas egzogenny. Prekursor serotoniny i melatoniny.', sys:'serotonin' },
  { id:'5HT_TPH2', type:'syntheticEnzyme', label:'TPH2', fullLabel:'TPH2 (Hydroksylaza tryptofanu 2)', x:230, y:430, description:'Hydroksylaza tryptofanu 2. OUN: jądra szwu. Etap limitujący syntezę 5-HT w mózgu.', sys:'serotonin' },
  { id:'5HT_5HTP', type:'precursor', label:'5-HTP', x:380, y:430, formula:'C₁₁H₁₂N₂O₃', description:'5-hydroksytryptofan. Pośredni prekursor serotoniny.', sys:'serotonin' },
  { id:'5HT', type:'neurotransmitter', label:'Serotonina', x:700, y:500, formula:'C₁₀H₁₂N₂O', description:'5-hydroksytryptamina. Regulacja nastroju, snu, apetytu, bólu. 90% w jelicie.', sys:'serotonin' },
  { id:'5HT_2A', type:'receptor', label:'5-HT₂A', x:870, y:430, description:'5-HT2A. Gq→↑IP3/DAG. Cel psychodelików (LSD, psylocybina).', gProtein:'Gq/11', signaling:'↑IP3/DAG → ↑Ca²⁺, PKC', functions:['Percepcja','Halucynacje','Plastyczność synaptyczna'], ligands:['Serotonina','DMT'], agonists:['LSD','Psylocybina','Meskalina','DMT'], antagonists:['Klozapina','Olanzapina','Trazodon'], sys:'serotonin' },
  { id:'5HT_1A', type:'receptor', label:'5-HT₁A', x:870, y:530, description:'5-HT1A. Gi/Go→↓cAMP. Cel: buspiron (lęk).', gProtein:'Gi/Go', signaling:'↓cAMP, ↑K⁺ (GIRK)', functions:['Anksjoliza','Antydepresja','Autoreceptor'], ligands:['Serotonina'], agonists:['Buspiron','Tandospiron'], antagonists:['WAY-100635'], sys:'serotonin' },
  { id:'SERT', type:'transporter', label:'SERT', x:530, y:570, description:'Transporter serotoniny (SLC6A4). Cel SSRI (fluoksetyna, sertralina) i MDMA.', sys:'serotonin' },
];

const EDGES = [
  ['DA_Tyr','DA_TH','conversion'], ['DA_TH','DA_LDOPA','synthesis'],
  ['DA_LDOPA','AADC','conversion'], ['AADC','DA','synthesis'],
  ['DA','DA_D1','binding'], ['DA','DA_D2','binding'], ['DA','DA_D3','binding'],
  ['DAT','DA','reuptake'], ['DA','MAO-A','degradation'],
  ['5HT_Trp','5HT_TPH2','conversion'], ['5HT_TPH2','5HT_5HTP','synthesis'],
  ['5HT_5HTP','AADC','conversion'], ['AADC','5HT','synthesis'],
  ['5HT','5HT_2A','binding'], ['5HT','5HT_1A','binding'],
  ['SERT','5HT','reuptake'],
];

const TYPE_COLORS = {
  neurotransmitter:'#4ade80', syntheticEnzyme:'#60a5fa', catabolicEnzyme:'#f87171',
  receptor:'#c084fc', transporter:'#22d3ee', precursor:'#f59e0b', metabolite:'#94a3b8',
};
const TYPE_LABELS = {
  neurotransmitter:'Neuroprzekaźnik', syntheticEnzyme:'Enzym syntezy',
  catabolicEnzyme:'Enzym degradacji', receptor:'Receptor',
  transporter:'Transporter', precursor:'Prekursor', metabolite:'Metabolit',
};
const EDGE_STYLES = {
  synthesis:   { color:'rgba(96,165,250,0.85)', width:1.5, dash:[] },
  degradation: { color:'rgba(248,113,113,0.9)', width:1.5, dash:[6,3] },
  binding:     { color:'rgba(192,132,252,0.85)', width:2, dash:[8,4] },
  reuptake:    { color:'rgba(34,211,238,0.85)', width:1.5, dash:[5,4] },
  conversion:  { color:'rgba(245,158,11,0.75)', width:1.8, dash:[4,3] },
};

const AtlasCanvas = ({ activeSystems, onSelectNode, onHoverNode }) => {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const [camera, setCamera] = useState({ x: 450, y: 350, scale: 0.85 });
  const dragRef = useRef(null);
  const [hoverId, setHoverId] = useState(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const visibleNodes = NODES.filter(n => activeSystems.has(n.sys) || n.sys === 'shared');
  const visibleIds = new Set(visibleNodes.map(n => n.id));
  const visibleEdges = EDGES.filter(([a,b]) => visibleIds.has(a) && visibleIds.has(b));

  // draw
  useEffect(() => {
    const cvs = canvasRef.current; if (!cvs) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = cvs.getBoundingClientRect();
    cvs.width = rect.width * dpr; cvs.height = rect.height * dpr;
    const ctx = cvs.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    // camera
    ctx.save();
    ctx.translate(rect.width/2 - camera.x * camera.scale, rect.height/2 - camera.y * camera.scale);
    ctx.scale(camera.scale, camera.scale);

    // edges
    visibleEdges.forEach(([a,b,type]) => {
      const na = NODES.find(n=>n.id===a), nb = NODES.find(n=>n.id===b);
      if (!na || !nb) return;
      const st = EDGE_STYLES[type] || EDGE_STYLES.synthesis;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y); ctx.lineTo(nb.x, nb.y);
      ctx.strokeStyle = st.color; ctx.lineWidth = st.width/camera.scale;
      ctx.setLineDash(st.dash);
      ctx.stroke();
      // arrow
      const ang = Math.atan2(nb.y-na.y, nb.x-na.x);
      const inset = 32/camera.scale;
      const tx = nb.x - Math.cos(ang)*inset, ty = nb.y - Math.sin(ang)*inset;
      const aSize = 6/camera.scale;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx - Math.cos(ang-0.5)*aSize, ty - Math.sin(ang-0.5)*aSize);
      ctx.lineTo(tx - Math.cos(ang+0.5)*aSize, ty - Math.sin(ang+0.5)*aSize);
      ctx.closePath(); ctx.fillStyle = st.color; ctx.fill();
      ctx.setLineDash([]);
    });

    // nodes
    visibleNodes.forEach(n => {
      const c = TYPE_COLORS[n.type];
      const hovered = hoverId === n.id;
      ctx.save();
      ctx.shadowBlur = hovered ? 24 : 10;
      ctx.shadowColor = c;
      ctx.fillStyle = c;
      if (n.type === 'neurotransmitter') {
        ctx.beginPath(); ctx.arc(n.x, n.y, 34, 0, Math.PI*2); ctx.fill();
      } else if (n.type === 'precursor') {
        ctx.beginPath(); ctx.arc(n.x, n.y, 26, 0, Math.PI*2); ctx.fill();
      } else if (n.type === 'metabolite') {
        ctx.beginPath(); ctx.arc(n.x, n.y, 16, 0, Math.PI*2); ctx.fill();
      } else if (n.type === 'receptor') {
        const r = 26;
        ctx.beginPath();
        for (let i=0;i<6;i++){const a=Math.PI/3*i - Math.PI/2; const px=n.x+Math.cos(a)*r, py=n.y+Math.sin(a)*r; if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);}
        ctx.closePath(); ctx.fill();
      } else if (n.type === 'transporter') {
        const r = 24;
        ctx.beginPath();
        ctx.moveTo(n.x, n.y-r); ctx.lineTo(n.x+r, n.y); ctx.lineTo(n.x, n.y+r); ctx.lineTo(n.x-r, n.y);
        ctx.closePath(); ctx.fill();
      } else {
        // enzyme — pill
        const w=80, h=30;
        ctx.beginPath();
        const x=n.x-w/2, y=n.y-h/2, r=h/2;
        ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arc(x+w-r,y+r,r,-Math.PI/2,Math.PI/2);
        ctx.lineTo(x+r,y+h); ctx.arc(x+r,y+r,r,Math.PI/2,-Math.PI/2);
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();

      // label
      ctx.fillStyle = n.type === 'metabolite' ? '#f1f5f9' : '#0a0a1a';
      ctx.font = `700 ${n.type==='neurotransmitter'?14:12}px Outfit, sans-serif`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(n.label, n.x, n.y);
    });

    ctx.restore();
  }, [camera, hoverId, activeSystems]);

  // hit test
  const hitTest = (mx, my) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const wx = (mx - rect.width/2) / camera.scale + camera.x;
    const wy = (my - rect.height/2) / camera.scale + camera.y;
    for (let i=visibleNodes.length-1; i>=0; i--) {
      const n = visibleNodes[i];
      const r = n.type==='neurotransmitter'?34 : n.type==='precursor'?26 : n.type==='metabolite'?16 : n.type==='receptor'||n.type==='transporter'?26 : 42;
      const dx=wx-n.x, dy=wy-n.y;
      if (dx*dx+dy*dy < r*r) return n;
    }
    return null;
  };

  const onMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    if (dragRef.current) {
      const dx = mx - dragRef.current.mx, dy = my - dragRef.current.my;
      setCamera(c => ({ ...c, x: dragRef.current.cx - dx/c.scale, y: dragRef.current.cy - dy/c.scale }));
      return;
    }
    setMouse({ x: e.clientX, y: e.clientY });
    const hit = hitTest(mx, my);
    setHoverId(hit ? hit.id : null);
    onHoverNode(hit, { x: e.clientX, y: e.clientY });
  };

  const onMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    dragRef.current = { mx, my, cx: camera.x, cy: camera.y };
  };
  const onMouseUp = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const start = dragRef.current;
    dragRef.current = null;
    if (start && Math.abs(mx-start.mx) < 3 && Math.abs(my-start.my) < 3) {
      const hit = hitTest(mx, my);
      if (hit) {
        const fullNode = { ...hit, color: TYPE_COLORS[hit.type], typeLabel: TYPE_LABELS[hit.type] };
        onSelectNode(fullNode);
      }
    }
  };
  const onWheel = (e) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    setCamera(c => ({ ...c, scale: Math.max(0.25, Math.min(3, c.scale * (1 + delta))) }));
  };

  // expose camera control
  React.useEffect(() => {
    window.__ns_zoom_in  = () => setCamera(c => ({ ...c, scale: Math.min(3, c.scale*1.2) }));
    window.__ns_zoom_out = () => setCamera(c => ({ ...c, scale: Math.max(0.25, c.scale/1.2) }));
    window.__ns_reset    = () => setCamera({ x: 450, y: 350, scale: 0.85 });
  }, []);

  // bounds for minimap
  const bounds = {
    minX: Math.min(...visibleNodes.map(n=>n.x)) - 60,
    minY: Math.min(...visibleNodes.map(n=>n.y)) - 60,
    maxX: Math.max(...visibleNodes.map(n=>n.x)) + 60,
    maxY: Math.max(...visibleNodes.map(n=>n.y)) + 60,
  };
  window.__ns_minimap = { nodes: visibleNodes.map(n => ({ id:n.id, x:n.x, y:n.y, color: TYPE_COLORS[n.type] })), camera, bounds };

  return (
    <div className="ns-canvas-wrap" ref={wrapRef}>
      <canvas ref={canvasRef}
              onMouseMove={onMouseMove} onMouseDown={onMouseDown}
              onMouseUp={onMouseUp} onMouseLeave={() => { dragRef.current=null; setHoverId(null); onHoverNode(null); }}
              onWheel={onWheel}
              style={{ width:'100%', height:'100%', cursor: dragRef.current ? 'grabbing' : hoverId ? 'pointer' : 'grab' }} />
    </div>
  );
};

window.AtlasCanvas = AtlasCanvas;
window.TYPE_COLORS = TYPE_COLORS;
