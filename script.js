// ═══════════════════════════════════════════════════════════════════
//  NeuroShit — Interaktywna Mapa Neuroprzekaźników
//  Silnik: Canvas 2D z pan/zoom + wielokształtowy renderer
// ═══════════════════════════════════════════════════════════════════

(() => {
  "use strict";

  const encyclopedia = window.MEDICAL_ENCYCLOPEDIA;
  if (!encyclopedia || !encyclopedia.systems) {
    throw new Error("Brak danych. Upewnij się, że medical-encyclopedia.js jest załadowany przed script.js.");
  }

  const COLORS = encyclopedia.colors;
  const NODE_SHAPES = encyclopedia.nodeShapes;
  const CONNECTION_TYPES = encyclopedia.connectionTypes;

  // ── Budowanie grafu ────────────────────────────────────────────

  const allNodes = [];
  const allEdges = [];
  const nodeMap = new Map();
  const activeSystems = new Set(encyclopedia.systems.map(s => s.id));

  // Add shared nodes first
  encyclopedia.sharedNodes.forEach(sn => {
    const shapeDef = NODE_SHAPES[sn.type] || { shape: "circle", radius: 24 };
    const node = {
      id: sn.id,
      label: sn.label,
      type: sn.type,
      x: sn.x,
      y: sn.y,
      color: COLORS[sn.type] || "#94a3b8",
      description: sn.description || "",
      formula: sn.formula || "",
      systems: sn.systems || [],
      shape: shapeDef.shape,
      radius: shapeDef.radius || 30,
      width: shapeDef.width || 0,
      height: shapeDef.height || 0,
      renderAsLabel: !!shapeDef.renderAsLabel,
    };
    allNodes.push(node);
    nodeMap.set(node.id, node);
  });

  // Add system nodes
  encyclopedia.systems.forEach(system => {
    system.nodes.forEach(sn => {
      if (nodeMap.has(sn.id)) return; // skip duplicates
      const shapeDef = NODE_SHAPES[sn.type] || { shape: "circle", radius: 24 };
      const nodeColor = sn.type === "precursor"
        ? fadeColor(system.color, 0.45)
        : (COLORS[sn.type] || "#94a3b8");
      const node = {
        id: sn.id,
        label: sn.label,
        type: sn.type,
        x: sn.x,
        y: sn.y,
        color: nodeColor,
        description: sn.description || "",
        formula: sn.formula || "",
        systems: sn.systems || [system.id],
        systemName: system.name,
        shape: shapeDef.shape,
        radius: shapeDef.radius || 30,
        width: shapeDef.width || 0,
        height: shapeDef.height || 0,
        renderAsLabel: !!shapeDef.renderAsLabel,
        // Receptor extended data
        gProtein: sn.gProtein || "",
        signaling: sn.signaling || "",
        functions: sn.functions || [],
        activationEffects: sn.activationEffects || "",
        blockadeEffects: sn.blockadeEffects || "",
        naturalLigands: sn.naturalLigands || [],
        pharmaceuticalAgonists: sn.pharmaceuticalAgonists || [],
        pharmaceuticalAntagonists: sn.pharmaceuticalAntagonists || [],
      };
      allNodes.push(node);
      nodeMap.set(node.id, node);
    });

    system.connections.forEach(conn => {
      allEdges.push({
        from: conn.from,
        to: conn.to,
        connectionType: conn.connectionType,
        system: system.id,
        importance: conn.importance || "main",
      });
    });
  });

  // Visible nodes/edges (filtered)
  let visibleNodes = [];
  let visibleEdges = [];
  let synthesisChains = [];
  const mergedEdgeKeys = new Set();
  const groupedBindingEdgeKeys = new Set();
  let enzymeLabels = []; // bounding boxes for enzyme pill labels (hit-testing)

  // ── Receptor groups ────────────────────────────────────────────
  const receptorGroupData = []; // { hubLabel, members, system, color, sourceIds, hubNode }

  function makeEdgeKey(edge) {
    return `${edge.from}|${edge.to}|${edge.connectionType}|${edge.system}`;
  }

  function averagePosition(nodes) {
    if (!nodes.length) return { x: 0, y: 0 };
    let x = 0;
    let y = 0;
    nodes.forEach(node => {
      x += node.x;
      y += node.y;
    });
    return { x: x / nodes.length, y: y / nodes.length };
  }

  function estimateHubWidth(label) {
    return Math.max(56, 24 + label.length * 8);
  }

  encyclopedia.systems.forEach(system => {
    if (!system.receptorGroups) return;
    system.receptorGroups.forEach(group => {
      const memberNodes = group.members.map(id => nodeMap.get(id)).filter(Boolean);
      if (memberNodes.length < 2) return;

      const groupedSources = new Map();
      allEdges.forEach(edge => {
        if (edge.system !== system.id || edge.connectionType !== "binding") return;
        if (!group.members.includes(edge.to)) return;
        if (!groupedSources.has(edge.from)) groupedSources.set(edge.from, []);
        groupedSources.get(edge.from).push(edge);
      });

      const sourceIds = [];
      groupedSources.forEach((edges, sourceId) => {
        if (edges.length < 2) return;
        sourceIds.push(sourceId);
        edges.forEach(edge => groupedBindingEdgeKeys.add(makeEdgeKey(edge)));
      });

      if (!sourceIds.length) return;

      const memberCenter = averagePosition(memberNodes);
      const sourceCenter = averagePosition(sourceIds.map(id => nodeMap.get(id)).filter(Boolean));
      const dx = memberCenter.x - sourceCenter.x;
      const dy = memberCenter.y - sourceCenter.y;
      const dist = Math.max(1, Math.hypot(dx, dy));
      const hubOffset = Math.min(76, Math.max(42, dist * 0.34));
      const hubLabel = group.hubLabel || group.label;

      memberNodes.forEach(n => {
        n.receptorGroup = group.label;
        n.receptorGroupHubLabel = hubLabel;
        n.radius = 22; // smaller than normal 30
      });

      receptorGroupData.push({
        label: group.label,
        hubLabel,
        members: group.members,
        system: system.id,
        color: system.color,
        sourceIds,
        hubNode: {
          id: `group:${system.id}:${hubLabel}`,
          x: memberCenter.x - (dx / dist) * hubOffset,
          y: memberCenter.y - (dy / dist) * hubOffset,
          shape: "roundedRect",
          width: estimateHubWidth(hubLabel),
          height: 24,
        },
      });
    });
  });

  // Receptor interactions
  const interactionEdges = [];
  if (encyclopedia.receptorInteractions) {
    encyclopedia.receptorInteractions.forEach(ri => {
      interactionEdges.push({
        from: ri.from,
        to: ri.to,
        connectionType: "receptorInteraction",
        system: "__interaction__",
        effect: ri.effect || "modulation",
        description: ri.description || "",
      });
    });
  }

  let showAllInteractions = false;
  let highlightedReceptor = null; // node id for click-to-highlight mode

  function updateVisibility() {
    // A node is visible if any of its systems is active
    visibleNodes = allNodes.filter(node => {
      if (!node.systems || node.systems.length === 0) return true;
      return node.systems.some(s => activeSystems.has(s));
    });
    const visibleIds = new Set(visibleNodes.map(n => n.id));
    visibleEdges = allEdges.filter(edge => {
      if (!activeSystems.has(edge.system)) return false;
      if (groupedBindingEdgeKeys.has(makeEdgeKey(edge))) return false;
      return visibleIds.has(edge.from) && visibleIds.has(edge.to);
    });
    buildSynthesisChains();
  }

  updateVisibility();

  // ── Synthesis chain detection ─────────────────────────────────
  // Detect pairs: (A → Enzyme, precursorConversion) + (Enzyme → B, synthesis)
  // and: (NT → Enzyme, degradation) + (Enzyme → Metabolite, degradation)

  function buildSynthesisChains() {
    synthesisChains = [];
    mergedEdgeKeys.clear();

    const enzymeTypes = new Set(["syntheticEnzyme", "catabolicEnzyme"]);
    const enzymeIds = new Set();
    allNodes.forEach(n => { if (enzymeTypes.has(n.type)) enzymeIds.add(n.id); });

    const incomingToEnzyme = new Map();
    const outgoingFromEnzyme = new Map();

    visibleEdges.forEach(edge => {
      if (enzymeIds.has(edge.to)) {
        if (!incomingToEnzyme.has(edge.to)) incomingToEnzyme.set(edge.to, []);
        incomingToEnzyme.get(edge.to).push(edge);
      }
      if (enzymeIds.has(edge.from)) {
        if (!outgoingFromEnzyme.has(edge.from)) outgoingFromEnzyme.set(edge.from, []);
        outgoingFromEnzyme.get(edge.from).push(edge);
      }
    });

    enzymeIds.forEach(enzymeId => {
      const incoming = incomingToEnzyme.get(enzymeId) || [];
      const outgoing = outgoingFromEnzyme.get(enzymeId) || [];

      for (const inEdge of incoming) {
        for (const outEdge of outgoing) {
          const isSynthChain = inEdge.connectionType === "precursorConversion" && outEdge.connectionType === "synthesis";
          const isDegradChain = inEdge.connectionType === "degradation" && outEdge.connectionType === "degradation";

          if (isSynthChain || isDegradChain) {
            // For shared enzymes, only pair edges from the same system
            if (inEdge.system !== outEdge.system) continue;

            const substrate = nodeMap.get(inEdge.from);
            const enzyme = nodeMap.get(enzymeId);
            const product = nodeMap.get(outEdge.to);
            if (!substrate || !enzyme || !product) continue;

            const chainType = isSynthChain ? "synthesis" : "degradation";
            synthesisChains.push({
              substrate, enzyme, product,
              chainType,
              system: inEdge.system,
              importance: outEdge.importance || "main",
            });

            const inKey = `${inEdge.from}|${inEdge.to}|${inEdge.connectionType}|${inEdge.system}`;
            const outKey = `${outEdge.from}|${outEdge.to}|${outEdge.connectionType}|${outEdge.system}`;
            mergedEdgeKeys.add(inKey);
            mergedEdgeKeys.add(outKey);
          }
        }
      }
    });
  }

  function isEdgeMerged(edge) {
    return mergedEdgeKeys.has(makeEdgeKey(edge));
  }

  buildSynthesisChains();

  // ── Hit testing for shapes ─────────────────────────────────────

  function hitTestNode(node, wx, wy) {
    const dx = wx - node.x;
    const dy = wy - node.y;
    switch (node.shape) {
      case "roundedRect": {
        const hw = (node.width || 150) / 2 + 4;
        const hh = (node.height || 44) / 2 + 4;
        return Math.abs(dx) < hw && Math.abs(dy) < hh;
      }
      case "hexagon": {
        const r = (node.radius || 30) + 4;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < r * 1.1;
      }
      case "diamond": {
        const r = (node.radius || 32) + 4;
        return (Math.abs(dx) / r + Math.abs(dy) / r) < 1.15;
      }
      default: { // circle
        const r = (node.radius || 24) + 4;
        return Math.sqrt(dx * dx + dy * dy) < r;
      }
    }
  }

  // ── Edge intersection with shapes ──────────────────────────────

  function getShapeRadius(node, angle) {
    switch (node.shape) {
      case "roundedRect": {
        const hw = (node.width || 150) / 2;
        const hh = (node.height || 44) / 2;
        const cos = Math.abs(Math.cos(angle));
        const sin = Math.abs(Math.sin(angle));
        if (cos < 0.001) return hh;
        if (sin < 0.001) return hw;
        return Math.min(hw / cos, hh / sin);
      }
      case "hexagon": {
        return (node.radius || 30) * 0.95;
      }
      case "diamond": {
        const r = node.radius || 32;
        const cos = Math.abs(Math.cos(angle));
        const sin = Math.abs(Math.sin(angle));
        return r / (cos + sin + 0.001);
      }
      default:
        return node.radius || 24;
    }
  }


  // ── Utility ────────────────────────────────────────────────────

  function normalizeVector(dx, dy) {
    const len = Math.sqrt(dx * dx + dy * dy);
    if (!len) return null;
    return { x: dx / len, y: dy / len, len };
  }

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function fadeColor(hex, factor) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const fr = Math.round(r + (255 - r) * factor);
    const fg = Math.round(g + (255 - g) * factor);
    const fb = Math.round(b + (255 - b) * factor);
    return `#${fr.toString(16).padStart(2, "0")}${fg.toString(16).padStart(2, "0")}${fb.toString(16).padStart(2, "0")}`;
  }

  const SUBSCRIPT_DIGITS = {
    "₀": "0",
    "₁": "1",
    "₂": "2",
    "₃": "3",
    "₄": "4",
    "₅": "5",
    "₆": "6",
    "₇": "7",
    "₈": "8",
    "₉": "9",
  };

  function normalizeGroupToken(value) {
    return [...value]
      .map(char => SUBSCRIPT_DIGITS[char] || char)
      .join("")
      .replace(/[^\p{L}\p{N}]+/gu, "")
      .toLowerCase();
  }

  function getConnectionStyle(connectionType) {
    return CONNECTION_TYPES[connectionType] || CONNECTION_TYPES.synthesis;
  }


  // ── Edge geometry ──────────────────────────────────────────────

  function getEdgeGeometry(fromNode, toNode, style) {
    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const direction = normalizeVector(dx, dy);
    if (!direction) return null;

    const angle = Math.atan2(dy, dx);
    const startR = getShapeRadius(fromNode, angle) + 2;
    const endAngle = Math.atan2(-dy, -dx);
    const endR = getShapeRadius(toNode, endAngle) + 2;
    const arrowInset = style.arrow && style.arrow !== "none"
      ? (typeof style.arrowInset === "number" ? style.arrowInset : 8)
      : 0;

    const startX = fromNode.x + direction.x * startR;
    const startY = fromNode.y + direction.y * startR;
    const tipX = toNode.x - direction.x * endR;
    const tipY = toNode.y - direction.y * endR;
    const endX = tipX - direction.x * arrowInset;
    const endY = tipY - direction.y * arrowInset;

    return {
      startX, startY, endX, endY, tipX, tipY,
      nx: direction.x, ny: direction.y,
      px: -direction.y, py: direction.x,
      len: direction.len,
    };
  }

  function getQuadraticPoint(x0, y0, cx, cy, x1, y1, t) {
    const mt = 1 - t;
    return {
      x: mt * mt * x0 + 2 * mt * t * cx + t * t * x1,
      y: mt * mt * y0 + 2 * mt * t * cy + t * t * y1,
    };
  }

  function getQuadraticTangent(x0, y0, cx, cy, x1, y1, t) {
    return normalizeVector(
      2 * (1 - t) * (cx - x0) + 2 * t * (x1 - cx),
      2 * (1 - t) * (cy - y0) + 2 * t * (y1 - cy)
    );
  }


  // ── Drawing helpers ────────────────────────────────────────────

  function drawRoundedRect(x, y, w, h, radius) {
    const r = Math.min(radius, w * 0.5, h * 0.5);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawHexagonPath(cx, cy, r) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const px = cx + r * Math.cos(angle);
      const py = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  function drawDiamondPath(cx, cy, r) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r, cy);
    ctx.lineTo(cx, cy + r);
    ctx.lineTo(cx - r, cy);
    ctx.closePath();
  }

  function drawEdgeLabel(text, x, y, edgeColor) {
    ctx.save();
    ctx.font = "600 10px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const paddingX = 6;
    const height = 16;
    const width = Math.ceil(ctx.measureText(text).width) + paddingX * 2;
    drawRoundedRect(x - width * 0.5, y - height * 0.5, width, height, 6);
    ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
    ctx.fill();
    drawRoundedRect(x - width * 0.5, y - height * 0.5, width, height, 6);
    ctx.strokeStyle = edgeColor;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#e2e8f0";
    ctx.fillText(text, x, y + 0.5);
    ctx.restore();
  }


  // ── Rendering engine ───────────────────────────────────────────

  const canvas = document.getElementById("map");
  const ctx = canvas.getContext("2d", { alpha: true });
  const container = document.getElementById("canvas-container");
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  let W, H;
  let camera = { x: 0, y: 0, zoom: 0.45 };
  let targetCamera = { x: 0, y: 0, zoom: 0.45 };
  const LERP = 0.15;
  let frameHandle = 0;

  function resize() {
    W = container.clientWidth;
    H = container.clientHeight;
    canvas.width = W * pixelRatio;
    canvas.height = H * pixelRatio;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    requestRender();
  }

  window.addEventListener("resize", resize);
  resize();

  // Auto-fit camera to world bounds
  function fitToWorld() {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    visibleNodes.forEach(n => {
      const r = Math.max(n.radius || 0, (n.width || 0) / 2, 30);
      minX = Math.min(minX, n.x - r);
      minY = Math.min(minY, n.y - r);
      maxX = Math.max(maxX, n.x + r);
      maxY = Math.max(maxY, n.y + r);
    });
    if (!isFinite(minX)) return;
    const pad = 80;
    const worldW = maxX - minX + pad * 2;
    const worldH = maxY - minY + pad * 2;
    const panel = document.getElementById("info-panel");
    const rightInset = panel && !panel.classList.contains("hidden") && window.innerWidth > 768
      ? panel.offsetWidth + 32
      : 0;
    const availableW = Math.max(240, W - rightInset);
    const zoom = Math.min(availableW / worldW, H / worldH, 1.5);
    targetCamera.x = (minX + maxX) / 2 + rightInset / (2 * zoom);
    targetCamera.y = (minY + maxY) / 2;
    targetCamera.zoom = zoom;
    requestRender();
  }

  fitToWorld();

  function screenToWorld(sx, sy, cam = camera) {
    return {
      x: (sx - W / 2) / cam.zoom + cam.x,
      y: (sy - H / 2) / cam.zoom + cam.y,
    };
  }

  function getCanvasPoint(clientX, clientY) {
    const rect = container.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }


  // ── Drawing ────────────────────────────────────────────────────

  let hoveredNode = null;

  function isCameraAnimating() {
    return Math.abs(targetCamera.x - camera.x) > 0.1 ||
      Math.abs(targetCamera.y - camera.y) > 0.1 ||
      Math.abs(targetCamera.zoom - camera.zoom) > 0.001;
  }

  function requestRender() {
    if (frameHandle) return;
    frameHandle = requestAnimationFrame(() => {
      frameHandle = 0;
      const needsAnotherFrame = draw();
      if (needsAnotherFrame) requestRender();
    });
  }

  function draw() {
    const cameraAnimating = isCameraAnimating();
    if (cameraAnimating) {
      camera.x += (targetCamera.x - camera.x) * LERP;
      camera.y += (targetCamera.y - camera.y) * LERP;
      camera.zoom += (targetCamera.zoom - camera.zoom) * LERP;
    } else {
      camera.x = targetCamera.x;
      camera.y = targetCamera.y;
      camera.zoom = targetCamera.zoom;
    }

    enzymeLabels = []; // reset each frame

    ctx.clearRect(0, 0, W, H);
    drawGrid();

    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    visibleEdges.forEach(edge => { if (!isEdgeMerged(edge)) drawEdge(edge); });
    synthesisChains.forEach(chain => {
      if (activeSystems.has(chain.system)) drawSynthesisChain(chain);
    });

    // Draw receptor interactions
    const visibleIds = new Set(visibleNodes.map(n => n.id));
    if (showAllInteractions) {
      interactionEdges.forEach(edge => {
        if (visibleIds.has(edge.from) && visibleIds.has(edge.to)) {
          drawEdge(edge);
        }
      });
    } else if (highlightedReceptor) {
      // Dim everything
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.restore();
      // Draw only edges connected to highlighted receptor
      interactionEdges.forEach(edge => {
        if ((edge.from === highlightedReceptor || edge.to === highlightedReceptor) &&
            visibleIds.has(edge.from) && visibleIds.has(edge.to)) {
          drawEdge(edge);
        }
      });
    }

    // Draw receptor group hubs and subtype branches
    drawReceptorGroups();

    // Draw nodes — dim if highlighting and not connected
    const highlightConnected = new Set();
    if (highlightedReceptor) {
      highlightConnected.add(highlightedReceptor);
      interactionEdges.forEach(edge => {
        if (edge.from === highlightedReceptor) highlightConnected.add(edge.to);
        if (edge.to === highlightedReceptor) highlightConnected.add(edge.from);
      });
    }

    visibleNodes.forEach(node => {
      if (node.renderAsLabel) return; // enzyme nodes rendered as pill labels
      if (highlightedReceptor && !highlightConnected.has(node.id)) {
        ctx.save();
        ctx.globalAlpha = 0.15;
        drawNode(node, false);
        ctx.restore();
      } else {
        drawNode(node, node === hoveredNode);
      }
    });

    ctx.restore();

    document.getElementById("zoomLevel").textContent = `${Math.round(camera.zoom * 100)}%`;
    drawMinimap();
    return cameraAnimating;
  }

  function drawGrid() {
    let worldStep = 60;
    while (worldStep * camera.zoom < 28) worldStep *= 2;

    const step = worldStep * camera.zoom;
    const offsetX = (-camera.x * camera.zoom + W / 2) % step;
    const offsetY = (-camera.y * camera.zoom + H / 2) % step;

    ctx.strokeStyle = "rgba(71, 85, 105, 0.14)";
    ctx.lineWidth = 0.5;
    for (let x = offsetX - step; x < W + step; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = offsetY - step; y < H + step; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    const majorStep = step * 4;
    const majorOffsetX = (-camera.x * camera.zoom + W / 2) % majorStep;
    const majorOffsetY = (-camera.y * camera.zoom + H / 2) % majorStep;
    ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";
    ctx.lineWidth = 0.9;
    for (let x = majorOffsetX - majorStep; x < W + majorStep; x += majorStep) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = majorOffsetY - majorStep; y < H + majorStep; y += majorStep) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }

  function drawConnectionBetweenNodes(fromNode, toNode, style, options = {}) {
    const geometry = getEdgeGeometry(fromNode, toNode, style);
    if (!geometry) return null;

    const dash = Array.isArray(style.dash) ? style.dash : [];
    const curvature = typeof options.curvature === "number"
      ? options.curvature
      : (typeof style.curvature === "number" ? style.curvature : 0);

    // Use tipX (shape boundary) for control point midpoint
    const midX = (geometry.startX + geometry.tipX) * 0.5;
    const midY = (geometry.startY + geometry.tipY) * 0.5;
    const cpX = midX + geometry.px * curvature;
    const cpY = midY + geometry.py * curvature;

    const hasArrow = style.arrow && style.arrow !== "none" && options.showArrow !== false;
    const isBar = style.arrow === "bar";
    const arrowSz = typeof style.arrowSize === "number" ? style.arrowSize : 8;

    // Compute tangent at arrow tip (Bezier tangent for curves, straight for lines)
    let arrowNX = geometry.nx;
    let arrowNY = geometry.ny;
    if (Math.abs(curvature) > 0.01) {
      const t = normalizeVector(geometry.tipX - cpX, geometry.tipY - cpY);
      if (t) { arrowNX = t.x; arrowNY = t.y; }
    }

    // Line ends at arrow base (inset from tip along tangent direction)
    const lineEndX = (hasArrow && !isBar) ? geometry.tipX - arrowNX * arrowSz : geometry.tipX;
    const lineEndY = (hasArrow && !isBar) ? geometry.tipY - arrowNY * arrowSz : geometry.tipY;

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.setLineDash(dash);
    ctx.moveTo(geometry.startX, geometry.startY);

    if (Math.abs(curvature) > 0.01) {
      ctx.quadraticCurveTo(cpX, cpY, lineEndX, lineEndY);
    } else {
      ctx.lineTo(lineEndX, lineEndY);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    if (hasArrow) {
      drawArrow(geometry.tipX, geometry.tipY, arrowNX, arrowNY, style);
    }

    const label = typeof options.label === "string"
      ? options.label
      : (style.shortLabel || style.label);
    const minLen = typeof style.minLabelLength === "number" ? style.minLabelLength : 100;
    const shouldRenderLabel = options.showLabel !== undefined ? options.showLabel : style.renderLabel !== false;
    if (shouldRenderLabel && label && camera.zoom >= 0.6 && geometry.len >= minLen) {
      const t = 0.5;
      const lp = Math.abs(curvature) > 0.01
        ? getQuadraticPoint(geometry.startX, geometry.startY, cpX, cpY, geometry.endX, geometry.endY, t)
        : { x: midX, y: midY };
      const tan = Math.abs(curvature) > 0.01
        ? getQuadraticTangent(geometry.startX, geometry.startY, cpX, cpY, geometry.endX, geometry.endY, t)
        : normalizeVector(geometry.endX - geometry.startX, geometry.endY - geometry.startY);
      const normal = tan ? { x: -tan.y, y: tan.x } : { x: geometry.px, y: geometry.py };
      const lo = typeof style.labelOffset === "number" ? style.labelOffset : 12;
      drawEdgeLabel(label, lp.x + normal.x * lo, lp.y + normal.y * lo, style.color);
    }

    return geometry;
  }

  function drawEdge(edge) {
    const fromNode = nodeMap.get(edge.from);
    const toNode = nodeMap.get(edge.to);
    if (!fromNode || !toNode) return;

    const style = { ...getConnectionStyle(edge.connectionType) };
    if (edge.importance === "secondary") {
      style.color = style.color.replace(/rgba\(([^,]+,[^,]+,[^,]+),\s*[\d.]+\)/, "rgba($1, 0.15)");
      style.lineWidth = style.lineWidth * 0.5;
    }

    drawConnectionBetweenNodes(fromNode, toNode, style);
  }

  function drawArrow(x, y, nx, ny, style) {
    if (style.arrow === "bar") {
      const barHalf = typeof style.barHalfWidth === "number" ? style.barHalfWidth : 7;
      ctx.beginPath();
      ctx.strokeStyle = style.color;
      ctx.lineWidth = Math.max(2, style.lineWidth);
      ctx.moveTo(x + ny * barHalf, y - nx * barHalf);
      ctx.lineTo(x - ny * barHalf, y + nx * barHalf);
      ctx.stroke();
      return;
    }
    const sz = typeof style.arrowSize === "number" ? style.arrowSize : 8;
    const hw = sz * 0.55;
    ctx.fillStyle = style.color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - nx * sz + ny * hw, y - ny * sz - nx * hw);
    ctx.lineTo(x - nx * sz - ny * hw, y - ny * sz + nx * hw);
    ctx.closePath();
    ctx.fill();
  }


  // ── Synthesis chain rendering ──────────────────────────────────

  function drawSynthesisChain(chain) {
    const { substrate, enzyme, product, chainType } = chain;
    const baseStyle = chainType === "synthesis"
      ? CONNECTION_TYPES.synthesis
      : CONNECTION_TYPES.degradation;
    const style = { ...baseStyle };
    if (chain.importance === "secondary") {
      style.color = style.color.replace(/rgba\(([^,]+,[^,]+,[^,]+),\s*[\d.]+\)/, "rgba($1, 0.15)");
    }

    // Direct line: substrate → product (enzyme is just a label)
    const dx = product.x - substrate.x;
    const dy = product.y - substrate.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1) return;

    const dir = { x: dx / len, y: dy / len };
    const perp = { x: -dir.y, y: dir.x };

    // Start at edge of substrate shape
    const angleStart = Math.atan2(dy, dx);
    const startR = getShapeRadius(substrate, angleStart) + 2;
    const startX = substrate.x + dir.x * startR;
    const startY = substrate.y + dir.y * startR;

    // End at edge of product shape
    const endAngle = Math.atan2(-dy, -dx);
    const endR = getShapeRadius(product, endAngle) + 2;
    const arrowSz = typeof style.arrowSize === "number" ? style.arrowSize : 8;
    const tipX = product.x - dir.x * endR;
    const tipY = product.y - dir.y * endR;

    // Check if straight line passes too close to any other visible node
    let needsCurve = false;
    let curveOffset = 0;
    const checkMargin = 35;
    for (const node of visibleNodes) {
      if (node.id === substrate.id || node.id === product.id || node.id === enzyme.id) continue;
      const t = Math.max(0, Math.min(1, ((node.x - startX) * dx + (node.y - startY) * dy) / (len * len)));
      const closestX = startX + t * dx;
      const closestY = startY + t * dy;
      const dist = Math.sqrt((node.x - closestX) ** 2 + (node.y - closestY) ** 2);
      const nodeR = Math.max(node.radius || 0, (node.width || 0) / 2, 20);
      if (dist < nodeR + checkMargin && t > 0.1 && t < 0.9) {
        needsCurve = true;
        const side = (node.x - startX) * perp.x + (node.y - startY) * perp.y;
        curveOffset = (side > 0 ? -1 : 1) * (nodeR + checkMargin + 10);
        break;
      }
    }

    const midX = (startX + tipX) * 0.5;
    const midY = (startY + tipY) * 0.5;

    // Compute actual arrow direction (Bezier tangent for curved, straight otherwise)
    let arrowDirX = dir.x, arrowDirY = dir.y;
    if (needsCurve) {
      const cpX = midX + perp.x * curveOffset;
      const cpY = midY + perp.y * curveOffset;
      const t = normalizeVector(tipX - cpX, tipY - cpY);
      if (t) { arrowDirX = t.x; arrowDirY = t.y; }
    }

    // Line ends at arrow base (tangent-direction inset from tip)
    const lineEndX = tipX - arrowDirX * arrowSz;
    const lineEndY = tipY - arrowDirY * arrowSz;

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.setLineDash(Array.isArray(style.dash) ? style.dash : []);
    ctx.moveTo(startX, startY);

    let labelX, labelY;
    if (needsCurve) {
      const cpX = midX + perp.x * curveOffset;
      const cpY = midY + perp.y * curveOffset;
      ctx.quadraticCurveTo(cpX, cpY, lineEndX, lineEndY);
      labelX = 0.25 * startX + 0.5 * cpX + 0.25 * lineEndX;
      labelY = 0.25 * startY + 0.5 * cpY + 0.25 * lineEndY;
    } else {
      ctx.lineTo(lineEndX, lineEndY);
      labelX = midX;
      labelY = midY;
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Arrow at product boundary, pointing in tangent direction
    drawArrow(tipX, tipY, arrowDirX, arrowDirY, style);

    // Enzyme pill label at midpoint
    if (camera.zoom >= 0.35) {
      const enzymeName = enzyme.label.split("\n")[0];
      const labelColor = style.color;
      // Offset label slightly perpendicular to line
      const lo = needsCurve ? 0 : 10;
      const lx = labelX + perp.x * lo;
      const ly = labelY + perp.y * lo;
      drawEdgeLabel(enzymeName, lx, ly, labelColor);

      // Store bounding box for hit-testing
      ctx.save();
      ctx.font = "600 10px Inter, system-ui, sans-serif";
      const tw = Math.ceil(ctx.measureText(enzymeName).width) + 12;
      ctx.restore();
      const th = 16;
      enzymeLabels.push({
        x: lx - tw / 2, y: ly - th / 2, w: tw, h: th,
        node: enzyme,
      });
    }
  }

  // ── Receptor group rendering ──────────────────────────────────

  function drawReceptorGroups() {
    receptorGroupData.forEach(group => {
      if (!activeSystems.has(group.system)) return;

      const memberNodes = group.members.map(id => nodeMap.get(id)).filter(Boolean);
      if (memberNodes.length < 2) return;
      const hubNode = group.hubNode;

      const incomingStyle = {
        ...CONNECTION_TYPES.binding,
        color: hexToRgba(group.color, 0.28),
        lineWidth: 1.05,
        dash: [6, 4],
        renderLabel: false,
      };
      const outgoingStyle = {
        ...CONNECTION_TYPES.binding,
        color: hexToRgba(group.color, 0.5),
        lineWidth: 1.2,
        dash: [],
        renderLabel: false,
      };

      group.sourceIds.forEach(sourceId => {
        const sourceNode = nodeMap.get(sourceId);
        if (!sourceNode) return;
        drawConnectionBetweenNodes(sourceNode, hubNode, incomingStyle, { showLabel: false });
      });

      memberNodes.forEach((node, index) => {
        const curvature = memberNodes.length > 2 ? (index - (memberNodes.length - 1) * 0.5) * 6 : 0;
        drawConnectionBetweenNodes(hubNode, node, outgoingStyle, {
          showLabel: false,
          curvature,
        });
      });

      if (camera.zoom >= 0.16) {
        const x = hubNode.x - hubNode.width * 0.5;
        const y = hubNode.y - hubNode.height * 0.5;
        ctx.save();
        drawRoundedRect(x, y, hubNode.width, hubNode.height, 12);
        ctx.fillStyle = "rgba(7, 11, 20, 0.88)";
        ctx.fill();
        drawRoundedRect(x, y, hubNode.width, hubNode.height, 12);
        ctx.strokeStyle = hexToRgba(group.color, 0.68);
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.font = "700 10px Outfit, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#f8fafc";
        ctx.fillText(group.hubLabel, hubNode.x, hubNode.y + 0.5, hubNode.width - 12);
        ctx.restore();
      }
    });
  }

  // ── Node drawing (multi-shape) ─────────────────────────────────

  function drawNode(node, isHovered) {
    // Skip enzyme nodes — they're rendered as pill labels on arrows
    if (node.renderAsLabel) return;

    const pulse = 0;
    const projectedSize = Math.max(
      (node.radius || 24) * camera.zoom * 2,
      (node.width || 0) * camera.zoom,
      (node.height || 0) * camera.zoom
    );
    const lowDetail = projectedSize < 18;

    // Hover glow
    if (isHovered && !lowDetail) {
      const glowR = (node.radius || 30) * 2.5;
      const grad = ctx.createRadialGradient(node.x, node.y, glowR * 0.2, node.x, node.y, glowR);
      grad.addColorStop(0, `${node.color}40`);
      grad.addColorStop(1, `${node.color}00`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(node.x, node.y, glowR, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.save();
    ctx.shadowColor = hexToRgba(node.color, isHovered ? 0.5 : 0.24);
    ctx.shadowBlur = lowDetail ? 0 : (isHovered ? 20 : 10);

    switch (node.shape) {
      case "roundedRect":
        drawRectNode(node, isHovered, pulse, lowDetail);
        break;
      case "hexagon":
        drawHexNode(node, isHovered, pulse, lowDetail);
        break;
      case "diamond":
        drawDiamondNode(node, isHovered, pulse, lowDetail);
        break;
      default:
        drawCircleNode(node, isHovered, pulse, lowDetail);
        break;
    }

    ctx.restore();

    // Label
    drawNodeLabel(node);
  }

  function drawCircleNode(node, isHovered, pulse, lowDetail) {
    const r = (node.radius || 24) + pulse;
    let fill = hexToRgba(node.color, 0.2);
    if (!lowDetail) {
      fill = ctx.createRadialGradient(
        node.x - r * 0.3, node.y - r * 0.4, r * 0.15,
        node.x, node.y, r * 1.1
      );
      fill.addColorStop(0, hexToRgba(node.color, 0.38));
      fill.addColorStop(1, hexToRgba(node.color, 0.14));
    }

    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = hexToRgba(node.color, isHovered ? 0.95 : 0.68);
    ctx.lineWidth = isHovered ? 2.6 : 1.6;
    ctx.stroke();
  }

  function drawRectNode(node, isHovered, pulse, lowDetail) {
    const w = (node.width || 150) + pulse * 2;
    const h = (node.height || 44) + pulse;
    const x = node.x - w / 2;
    const y = node.y - h / 2;

    drawRoundedRect(x, y, w, h, 8);
    ctx.fillStyle = hexToRgba(node.color, lowDetail ? 0.12 : 0.2);
    ctx.fill();

    drawRoundedRect(x, y, w, h, 8);
    ctx.strokeStyle = hexToRgba(node.color, isHovered ? 0.95 : 0.68);
    ctx.lineWidth = isHovered ? 2.4 : 1.5;
    ctx.stroke();
  }

  function drawHexNode(node, isHovered, pulse, lowDetail) {
    const r = (node.radius || 30) + pulse;
    drawHexagonPath(node.x, node.y, r);
    ctx.fillStyle = hexToRgba(node.color, lowDetail ? 0.14 : 0.22);
    ctx.fill();

    const isGrouped = !!node.receptorGroup;
    drawHexagonPath(node.x, node.y, r);
    ctx.strokeStyle = hexToRgba(node.color, isHovered ? 0.95 : 0.68);
    ctx.lineWidth = isHovered ? 2.4 : (isGrouped ? 1.0 : 1.5);
    ctx.stroke();
  }

  function drawDiamondNode(node, isHovered, pulse, lowDetail) {
    const r = (node.radius || 32) + pulse;
    drawDiamondPath(node.x, node.y, r);
    ctx.fillStyle = hexToRgba(node.color, lowDetail ? 0.14 : 0.22);
    ctx.fill();

    drawDiamondPath(node.x, node.y, r);
    ctx.strokeStyle = hexToRgba(node.color, isHovered ? 0.95 : 0.68);
    ctx.lineWidth = isHovered ? 2.4 : 1.5;
    ctx.stroke();
  }

  function drawNodeLabel(node) {
    const projectedSize = Math.max(
      (node.radius || 24) * camera.zoom * 2,
      (node.width || 0) * camera.zoom,
      (node.height || 0) * camera.zoom
    );
    const minReadableSize = node.type === "neurotransmitter" ? 18 : 14;
    if (projectedSize < minReadableSize) return;

    const isSmall = (node.radius || 24) < 25 && node.shape === "circle";
    const isGrouped = !!node.receptorGroup;
    const fontSize = node.shape === "roundedRect" ? 10 :
      node.type === "neurotransmitter" ? 11 :
        isGrouped ? 8 :
          isSmall ? 8 : 9;

    ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
    ctx.fillStyle = "#f1f5f9";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // For grouped receptors, show only the distinguishing part
    let displayLabel = node.label;
    if (isGrouped && node.receptorGroup) {
      const hubLabel = normalizeGroupToken(node.receptorGroupHubLabel || node.receptorGroup || "");
      const plainLabel = normalizeGroupToken(node.label);
      if (hubLabel && plainLabel.startsWith(hubLabel)) {
        const suffix = plainLabel.slice(hubLabel.length);
        displayLabel = suffix ? suffix.toUpperCase() : node.label;
      }
    }

    const lines = displayLabel.split("\n");
    const lineH = fontSize + 2;
    const startY = node.y - ((lines.length - 1) * lineH) / 2;

    const maxW = node.shape === "roundedRect" ? (node.width || 150) - 10 :
      (node.radius || 24) * 1.8;

    lines.forEach((line, i) => {
      ctx.fillText(line, node.x, startY + i * lineH, maxW);
    });
  }


  // ── Interaction: Pan / Zoom ────────────────────────────────────

  let isPanning = false;
  let isRightZooming = false;
  let panStart = { x: 0, y: 0 };
  let rightZoomStartY = 0;
  let lastMouse = { canvasX: 0, canvasY: 0, clientX: 0, clientY: 0 };

  container.addEventListener("contextmenu", e => e.preventDefault());

  container.addEventListener("mousedown", e => {
    const point = getCanvasPoint(e.clientX, e.clientY);
    lastMouse.canvasX = point.x;
    lastMouse.canvasY = point.y;
    lastMouse.clientX = e.clientX;
    lastMouse.clientY = e.clientY;
    if (e.button === 0) { isPanning = true; panStart.x = e.clientX; panStart.y = e.clientY; }
    if (e.button === 2) { isRightZooming = true; rightZoomStartY = e.clientY; container.classList.add("is-right-zooming"); }
  });

  window.addEventListener("mousemove", e => {
    const point = getCanvasPoint(e.clientX, e.clientY);
    lastMouse.canvasX = point.x;
    lastMouse.canvasY = point.y;
    lastMouse.clientX = e.clientX;
    lastMouse.clientY = e.clientY;

    if (isRightZooming) {
      const dy = e.clientY - rightZoomStartY;
      if (dy !== 0) { zoomAt(lastMouse.canvasX, lastMouse.canvasY, Math.exp(-dy * 0.01)); rightZoomStartY = e.clientY; }
      return;
    }
    if (isPanning) {
      targetCamera.x -= (e.clientX - panStart.x) / camera.zoom;
      targetCamera.y -= (e.clientY - panStart.y) / camera.zoom;
      panStart.x = e.clientX; panStart.y = e.clientY;
      requestRender();
      return;
    }
    updateHover(point.x, point.y, e.clientX, e.clientY);
  });

  window.addEventListener("mouseup", e => {
    if (e.button === 0) isPanning = false;
    if (e.button === 2) { isRightZooming = false; container.classList.remove("is-right-zooming"); }
  });

  window.addEventListener("blur", () => {
    isPanning = false; isRightZooming = false; container.classList.remove("is-right-zooming");
  });

  container.addEventListener("wheel", e => {
    e.preventDefault();
    const point = getCanvasPoint(e.clientX, e.clientY);
    lastMouse.canvasX = point.x;
    lastMouse.canvasY = point.y;
    if (e.ctrlKey || e.metaKey) { zoomAt(point.x, point.y, 1 - e.deltaY * 0.01); return; }
    targetCamera.x += e.deltaX / camera.zoom;
    targetCamera.y += e.deltaY / camera.zoom;
    requestRender();
  }, { passive: false });

  function zoomAt(sx, sy, factor) {
    const wb = screenToWorld(sx, sy, targetCamera);
    targetCamera.zoom = Math.max(0.08, Math.min(5, targetCamera.zoom * factor));
    const wa = screenToWorld(sx, sy, targetCamera);
    targetCamera.x -= wa.x - wb.x;
    targetCamera.y -= wa.y - wb.y;
    requestRender();
  }

  // Touch
  let touches = [];
  let lastPinchDist = 0;
  let lastTouchCenter = { x: 0, y: 0 };

  container.addEventListener("touchstart", e => {
    e.preventDefault();
    touches = Array.from(e.touches);
    if (touches.length === 2) { lastPinchDist = getTouchDist(touches); lastTouchCenter = getTouchCenter(touches); }
    else if (touches.length === 1) { panStart.x = touches[0].clientX; panStart.y = touches[0].clientY; }
  }, { passive: false });

  container.addEventListener("touchmove", e => {
    e.preventDefault();
    const nt = Array.from(e.touches);
    if (nt.length === 2) {
      const dist = getTouchDist(nt);
      const center = getTouchCenter(nt);
      const canvasCenter = getCanvasPoint(center.x, center.y);
      if (lastPinchDist > 0) zoomAt(canvasCenter.x, canvasCenter.y, dist / lastPinchDist);
      targetCamera.x -= (center.x - lastTouchCenter.x) / camera.zoom;
      targetCamera.y -= (center.y - lastTouchCenter.y) / camera.zoom;
      lastPinchDist = dist; lastTouchCenter = center;
      return;
    }
    if (nt.length === 1) {
      targetCamera.x -= (nt[0].clientX - panStart.x) / camera.zoom;
      targetCamera.y -= (nt[0].clientY - panStart.y) / camera.zoom;
      panStart.x = nt[0].clientX; panStart.y = nt[0].clientY;
      requestRender();
    }
  }, { passive: false });

  container.addEventListener("touchend", e => { touches = Array.from(e.touches); lastPinchDist = 0; });

  function getTouchDist(t) { const dx = t[0].clientX - t[1].clientX; const dy = t[0].clientY - t[1].clientY; return Math.sqrt(dx * dx + dy * dy); }
  function getTouchCenter(t) { return { x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 }; }


  // ── Hover & Tooltip ────────────────────────────────────────────

  const tooltip = document.getElementById("tooltip");

  const TYPE_LABELS = {
    neurotransmitter: "Neuroprzekaźnik",
    syntheticEnzyme: "Enzym syntezy",
    catabolicEnzyme: "Enzym degradacji",
    receptor: "Receptor",
    transporter: "Transporter",
    precursor: "Prekursor",
    metabolite: "Metabolit",
  };

  function updateHover(sx, sy, clientX, clientY) {
    const previousHovered = hoveredNode;
    const world = screenToWorld(sx, sy);
    let closest = null;

    for (const node of visibleNodes) {
      if (node.renderAsLabel) continue; // skip enzyme nodes
      if (hitTestNode(node, world.x, world.y)) {
        closest = node;
        break;
      }
    }

    // Check enzyme pill labels
    if (!closest) {
      for (const el of enzymeLabels) {
        if (world.x >= el.x && world.x <= el.x + el.w &&
            world.y >= el.y && world.y <= el.y + el.h) {
          closest = el.node;
          break;
        }
      }
    }

    hoveredNode = closest;

    if (hoveredNode !== previousHovered) {
      requestRender();
    }

    if (closest) {
      container.style.cursor = "pointer";
      tooltip.innerHTML = `
      <div class="tt-title">${closest.label.replace(/\n/g, ' ')}</div>
      <div class="tt-type" style="color:${closest.color}">${TYPE_LABELS[closest.type] || closest.type}</div>
      ${closest.formula ? `<div class="tt-desc">${closest.formula}</div>` : ""}
      <div class="tt-desc">${(closest.description || "").split("\n").join("<br>")}</div>
    `;
      tooltip.classList.remove("hidden");
      let tx = clientX + 16;
      let ty = clientY + 16;
      const rect = tooltip.getBoundingClientRect();
      if (tx + rect.width + 10 > window.innerWidth) tx = clientX - rect.width - 10;
      if (ty + rect.height + 10 > window.innerHeight) ty = clientY - rect.height - 10;
      tooltip.style.left = `${tx}px`;
      tooltip.style.top = `${ty}px`;
      return;
    }

    container.style.cursor = isPanning ? "grabbing" : (isRightZooming ? "ns-resize" : "grab");
    tooltip.classList.add("hidden");
  }


  // ── Click → Info Panel ─────────────────────────────────────────

  const infoPanel = document.getElementById("info-panel");
  const panelTitle = document.getElementById("panel-title");
  const panelContent = document.getElementById("panel-content");

  container.addEventListener("click", e => {
    if (isPanning || isRightZooming) return;
    const point = getCanvasPoint(e.clientX, e.clientY);
    const world = screenToWorld(point.x, point.y);
    let clicked = null;
    for (const node of visibleNodes) {
      if (node.renderAsLabel) continue;
      if (hitTestNode(node, world.x, world.y)) { clicked = node; break; }
    }
    // Check enzyme pill labels
    if (!clicked) {
      for (const el of enzymeLabels) {
        if (world.x >= el.x && world.x <= el.x + el.w &&
            world.y >= el.y && world.y <= el.y + el.h) {
          clicked = el.node;
          break;
        }
      }
    }
    if (clicked) {
      showPanel(clicked);
      // Toggle highlight for receptors in classic mode
      if (clicked.type === "receptor" && !showAllInteractions) {
        highlightedReceptor = highlightedReceptor === clicked.id ? null : clicked.id;
      }
    } else {
      highlightedReceptor = null;
    }
    requestRender();
  });

  document.getElementById("close-panel").addEventListener("click", () => {
    infoPanel.classList.add("hidden");
    requestRender();
  });

  function showPanel(node) {
    panelTitle.textContent = node.label.replace(/\n/g, ' ');
    panelTitle.style.color = node.color;

    let html = "";

    html += `<div class="detail-section">
    <h3>Typ</h3>
    <p><span class="tag" style="background:${hexToRgba(node.color, 0.2)}; color:${node.color}">${TYPE_LABELS[node.type] || node.type}</span></p>
  </div>`;

    if (node.systemName) {
      html += `<div class="detail-section"><h3>System</h3><p>${node.systemName}</p></div>`;
    }

    if (node.formula) {
      html += `<div class="detail-section"><h3>Wzór / Struktura</h3><p>${node.formula}</p></div>`;
    }

    if (node.description) {
      html += `<div class="detail-section"><h3>Opis</h3><p>${node.description.split("\n").join("<br>")}</p></div>`;
    }

    // Receptor extended info
    if (node.type === "receptor") {
      if (node.gProtein) {
        html += `<div class="detail-section"><h3>Białko G / Mechanizm</h3><p>${node.gProtein}</p></div>`;
      }
      if (node.signaling) {
        html += `<div class="detail-section"><h3>Sygnalizacja</h3><p>${node.signaling}</p></div>`;
      }
      if (node.functions && node.functions.length) {
        html += `<div class="detail-section"><h3>Funkcje</h3><p>${node.functions.join(", ")}</p></div>`;
      }
      if (node.activationEffects) {
        html += `<div class="detail-section"><h3>Efekty aktywacji</h3><p style="color:#4ade80">${node.activationEffects}</p></div>`;
      }
      if (node.blockadeEffects) {
        html += `<div class="detail-section"><h3>Efekty blokady</h3><p style="color:#f87171">${node.blockadeEffects}</p></div>`;
      }
      if (node.naturalLigands && node.naturalLigands.length) {
        const tags = node.naturalLigands.map(l => `<span class="tag" style="background:rgba(74,222,128,0.15);color:#4ade80">${l}</span>`).join(" ");
        html += `<div class="detail-section"><h3>Ligandy naturalne</h3><p>${tags}</p></div>`;
      }
      if (node.pharmaceuticalAgonists && node.pharmaceuticalAgonists.length) {
        const tags = node.pharmaceuticalAgonists.map(l => `<span class="tag" style="background:rgba(96,165,250,0.15);color:#60a5fa">${l}</span>`).join(" ");
        html += `<div class="detail-section"><h3>Agoniści farmaceutyczni</h3><p>${tags}</p></div>`;
      }
      if (node.pharmaceuticalAntagonists && node.pharmaceuticalAntagonists.length) {
        const tags = node.pharmaceuticalAntagonists.map(l => `<span class="tag" style="background:rgba(248,113,113,0.15);color:#f87171">${l}</span>`).join(" ");
        html += `<div class="detail-section"><h3>Antagoniści farmaceutyczni</h3><p>${tags}</p></div>`;
      }

      // Receptor interactions
      const relatedInteractions = interactionEdges.filter(e => e.from === node.id || e.to === node.id);
      if (relatedInteractions.length) {
        const interactionList = relatedInteractions.map(edge => {
          const otherId = edge.from === node.id ? edge.to : edge.from;
          const otherNode = nodeMap.get(otherId);
          const otherLabel = otherNode ? otherNode.label.replace(/\n/g, ' ') : otherId;
          const dir = edge.from === node.id ? "→" : "←";
          const effectColor = edge.effect === "facilitation" ? "#4ade80" : edge.effect === "inhibition" ? "#f87171" : "#fbbf24";
          return `<span style="color:${effectColor}">${dir}</span> ${otherLabel} <span style="color:#64748b;font-size:10px">${edge.description}</span>`;
        });
        html += `<div class="detail-section"><h3>Interakcje receptorowe (${relatedInteractions.length})</h3><p>${interactionList.join("<br>")}</p></div>`;
      }
    }

    // Connections
    const visibleIds = new Set(visibleNodes.map(n => n.id));
    const connections = allEdges.filter(edge => {
      if (!activeSystems.has(edge.system)) return false;
      if (!visibleIds.has(edge.from) || !visibleIds.has(edge.to)) return false;
      return edge.from === node.id || edge.to === node.id;
    });
    if (connections.length) {
      const connected = connections.map(edge => {
        const otherId = edge.from === node.id ? edge.to : edge.from;
        const otherNode = nodeMap.get(otherId);
        const connLabel = getConnectionStyle(edge.connectionType).label;
        return `${otherNode ? otherNode.label.replace(/\n/g, ' ') : otherId} <span style="color:#64748b">(${connLabel})</span>`;
      });
      html += `<div class="detail-section"><h3>Połączenia (${connected.length})</h3><p>${[...new Set(connected)].join("<br>")}</p></div>`;
    }

    panelContent.innerHTML = html;
    infoPanel.classList.remove("hidden");
  }


  // ── Toolbar ────────────────────────────────────────────────────

  // Interaction toggle
  const interactionBtn = document.getElementById("toggleInteractions");
  interactionBtn.addEventListener("click", () => {
    showAllInteractions = !showAllInteractions;
    highlightedReceptor = null;
    interactionBtn.style.background = showAllInteractions ? "rgba(251, 191, 36, 0.3)" : "";
    interactionBtn.style.borderColor = showAllInteractions ? "rgba(251, 191, 36, 0.5)" : "";
    requestRender();
  });

  document.getElementById("zoomIn").addEventListener("click", () => zoomAt(W / 2, H / 2, 1.3));
  document.getElementById("zoomOut").addEventListener("click", () => zoomAt(W / 2, H / 2, 0.7));
  document.getElementById("resetView").addEventListener("click", () => fitToWorld());

  window.addEventListener("keydown", e => {
    if (e.key === "+" || e.key === "=") zoomAt(W / 2, H / 2, 1.2);
    if (e.key === "-") zoomAt(W / 2, H / 2, 0.8);
    if (e.key === "0") fitToWorld();
    if (e.key === "Escape") infoPanel.classList.add("hidden");
  });


  // ── System filters ─────────────────────────────────────────────

  const filterDropdown = document.getElementById("filter-dropdown");
  const filterToggle = document.getElementById("toggle-filters");

  function buildFilterUI() {
    filterDropdown.innerHTML = "";
    encyclopedia.systems.forEach(sys => {
      const label = document.createElement("label");
      label.className = "filter-item";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = activeSystems.has(sys.id);
      cb.addEventListener("change", () => {
        if (cb.checked) activeSystems.add(sys.id);
        else activeSystems.delete(sys.id);
        updateVisibility();
        requestRender();
      });
      const dot = document.createElement("span");
      dot.className = "filter-dot";
      dot.style.background = sys.color;
      label.appendChild(cb);
      label.appendChild(dot);
      label.appendChild(document.createTextNode(" " + sys.name));
      filterDropdown.appendChild(label);
    });
  }

  buildFilterUI();

  filterToggle.addEventListener("click", e => {
    e.stopPropagation();
    filterDropdown.classList.toggle("hidden");
  });

  document.addEventListener("click", e => {
    if (!filterDropdown.contains(e.target) && e.target !== filterToggle) {
      filterDropdown.classList.add("hidden");
    }
  });


  // ── Minimap ────────────────────────────────────────────────────

  const minimapCanvas = document.getElementById("minimap-canvas");
  const minimapCtx = minimapCanvas.getContext("2d");
  const minimapViewport = document.getElementById("minimap-viewport");
  const minimapEl = document.getElementById("minimap");

  function drawMinimap() {
    const mW = minimapEl.clientWidth;
    const mH = minimapEl.clientHeight;
    minimapCanvas.width = mW * pixelRatio;
    minimapCanvas.height = mH * pixelRatio;
    minimapCanvas.style.width = `${mW}px`;
    minimapCanvas.style.height = `${mH}px`;
    minimapCtx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    allNodes.forEach(n => {
      const r = Math.max(n.radius || 0, (n.width || 0) / 2, 20);
      minX = Math.min(minX, n.x - r); minY = Math.min(minY, n.y - r);
      maxX = Math.max(maxX, n.x + r); maxY = Math.max(maxY, n.y + r);
    });
    if (!isFinite(minX)) return;

    const pad = 50;
    minX -= pad; minY -= pad; maxX += pad; maxY += pad;
    const worldW = maxX - minX;
    const worldH = maxY - minY;
    const scale = Math.min(mW / worldW, mH / worldH);
    const offX = (mW - worldW * scale) / 2;
    const offY = (mH - worldH * scale) / 2;

    minimapCtx.clearRect(0, 0, mW, mH);

    visibleEdges.forEach(edge => {
      const from = nodeMap.get(edge.from);
      const to = nodeMap.get(edge.to);
      if (!from || !to) return;
      const style = { ...getConnectionStyle(edge.connectionType) };
      if (edge.importance === "secondary") {
        style.color = style.color.replace(/rgba\(([^,]+,[^,]+,[^,]+),\s*[\d.]+\)/, "rgba($1, 0.15)");
        style.lineWidth = style.lineWidth * 0.5;
      }
      minimapCtx.beginPath();
      minimapCtx.strokeStyle = style.color;
      minimapCtx.lineWidth = Math.max(0.5, style.lineWidth * 0.3);
      minimapCtx.moveTo((from.x - minX) * scale + offX, (from.y - minY) * scale + offY);
      minimapCtx.lineTo((to.x - minX) * scale + offX, (to.y - minY) * scale + offY);
      minimapCtx.stroke();
    });

    visibleNodes.forEach(node => {
      if (node.renderAsLabel) return; // skip enzyme nodes on minimap
      const sx = (node.x - minX) * scale + offX;
      const sy = (node.y - minY) * scale + offY;
      const sr = Math.max(1.5, (node.radius || 20) * scale * 0.6);
      minimapCtx.beginPath();
      minimapCtx.arc(sx, sy, sr, 0, Math.PI * 2);
      minimapCtx.fillStyle = node.color;
      minimapCtx.globalAlpha = 0.6;
      minimapCtx.fill();
      minimapCtx.globalAlpha = 1;
    });

    const vpLeft = (camera.x - W / 2 / camera.zoom - minX) * scale + offX;
    const vpTop = (camera.y - H / 2 / camera.zoom - minY) * scale + offY;
    const vpW = (W / camera.zoom) * scale;
    const vpH = (H / camera.zoom) * scale;
    minimapViewport.style.left = `${Math.max(0, vpLeft)}px`;
    minimapViewport.style.top = `${Math.max(0, vpTop)}px`;
    minimapViewport.style.width = `${Math.min(vpW, mW)}px`;
    minimapViewport.style.height = `${Math.min(vpH, mH)}px`;
  }

  // ── Start ──────────────────────────────────────────────────────

  requestRender();

})();
