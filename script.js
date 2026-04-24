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
  const BRAIN_REGIONS = encyclopedia.brainRegions || [];
  const BRAIN_PATHWAYS = encyclopedia.brainPathways || [];
  const RECEPTOR_BRAIN_REGIONS = encyclopedia.receptorBrainRegions || {};
  const SYSTEM_META_BY_ID = new Map((encyclopedia.systems || []).map(system => [system.id, system]));
  const SHARED_NODE_IDS = new Set((encyclopedia.sharedNodes || []).map(node => node.id));
  const SYSTEM_LAYOUT_SEQUENCE = [
    "dopamine",
    "norepinephrine",
    "traceAmines",
    "serotonin",
    "histamine",
    "orexin",
    "npy",
    "oxytocinVasopressin",
    "acetylcholine",
    "glutamate",
    "gaba",
    "purines",
    "endocannabinoids",
    "endorphins",
    "tachykinins",
  ];
  const BRAIN_ATLAS_ASSET = {
    src: "assets/brain-human-lateral-view.svg",
    x: -640,
    y: -760,
    width: 1280,
    height: 1525,
  };
  const BRAIN_REGION_ATLAS_LAYOUT = {
    BR_PFC: { anchor: [0.15, 0.27], label: [0.12, 0.24], width: 132 },
    BR_CORTEX: { anchor: [0.66, 0.18], label: [0.72, 0.16], width: 138 },
    BR_HIPPOCAMPUS: { anchor: [0.42, 0.52], label: [0.24, 0.54], width: 132 },
    BR_AMYGDALA: { anchor: [0.34, 0.57], label: [0.18, 0.59], width: 136 },
    BR_STRIATUM: { anchor: [0.44, 0.40], label: [0.31, 0.40], width: 136 },
    BR_NACC: { anchor: [0.36, 0.48], label: [0.21, 0.48], width: 148, height: 48 },
    BR_HYPOTHALAMUS: { anchor: [0.47, 0.60], label: [0.58, 0.63], width: 140 },
    BR_THALAMUS: { anchor: [0.50, 0.38], label: [0.60, 0.35], width: 118 },
    BR_MIDBRAIN_DA: { anchor: [0.58, 0.67], label: [0.73, 0.69], width: 168, height: 48 },
    BR_BRAINSTEM: { anchor: [0.56, 0.87], label: [0.61, 0.92], width: 118 },
    BR_LC: { anchor: [0.60, 0.74], label: [0.78, 0.65], width: 122 },
    BR_RAPHE: { anchor: [0.52, 0.78], label: [0.39, 0.79], width: 118 },
    BR_CEREBELLUM: { anchor: [0.79, 0.54], label: [0.83, 0.53], width: 114 },
    BR_PAG: { anchor: [0.55, 0.61], label: [0.71, 0.58], width: 92 },
    BR_NTS_AP: { anchor: [0.53, 0.90], label: [0.31, 0.91], width: 152, height: 48 },
    BR_OLFACTORY: { anchor: [0.10, 0.58], label: [0.10, 0.73], width: 162, height: 48 },
    BR_SEPTAL_BNST: { anchor: [0.31, 0.42], label: [0.16, 0.34], width: 150, height: 48 },
    BR_BASAL_FOREBRAIN: { anchor: [0.24, 0.50], label: [0.08, 0.48], width: 176, height: 48 },
    BR_SCN: { anchor: [0.40, 0.60], label: [0.33, 0.67], width: 132 },
    BR_CHOROID: { anchor: [0.54, 0.32], label: [0.72, 0.23], width: 134 },
    BR_HABENULA_IPN: { anchor: [0.58, 0.48], label: [0.80, 0.41], width: 170, height: 48 },
  };

  // ── Budowanie grafu ────────────────────────────────────────────

  const allNodes = [];
  const allEdges = [];
  const nodeMap = new Map();
  const activeSystems = new Set(encyclopedia.systems.map(s => s.id));
  const infoPanel = document.getElementById("info-panel");
  const panelTitle = document.getElementById("panel-title");
  const panelContent = document.getElementById("panel-content");
  const tooltip = document.getElementById("tooltip");
  let hoveredNode = null;
  let panelNodeId = null;

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
      layoutSystem: null,
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
      const nodeColor = getSystemNodeColor(sn.type, system.color);
      const node = {
        id: sn.id,
        label: sn.label,
        type: sn.type,
        x: sn.x,
        y: sn.y,
        color: nodeColor,
        systemColor: system.color,
        typeColor: COLORS[sn.type] || system.color,
        description: sn.description || "",
        formula: sn.formula || "",
        systems: sn.systems || [system.id],
        systemName: system.name,
        layoutSystem: system.id,
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

  BRAIN_REGIONS.forEach(region => {
    if (nodeMap.has(region.id)) return;
    const shapeDef = NODE_SHAPES[region.type || "brainRegion"] || NODE_SHAPES.brainRegion || { shape: "roundedRect", width: 190, height: 58 };
    const node = {
      id: region.id,
      label: region.label,
      type: region.type || "brainRegion",
      x: region.x,
      y: region.y,
      color: COLORS.brainRegion || "#38bdf8",
      description: region.description || "",
      formula: region.formula || "",
      systems: [],
      systemName: "Regiony mózgu",
      layoutSystem: "__brain__",
      shape: shapeDef.shape,
      radius: shapeDef.radius || 30,
      width: shapeDef.width || 0,
      height: shapeDef.height || 0,
      renderAsLabel: !!shapeDef.renderAsLabel,
      receptorIds: [],
    };
    allNodes.push(node);
    nodeMap.set(node.id, node);
  });

  const brainRegionEdgeKeys = new Set();
  Object.entries(RECEPTOR_BRAIN_REGIONS).forEach(([receptorId, regionIds]) => {
    const receptorNode = nodeMap.get(receptorId);
    if (!receptorNode || receptorNode.type !== "receptor" || !Array.isArray(regionIds)) return;

    regionIds.forEach(regionId => {
      const regionNode = nodeMap.get(regionId);
      const edgeKey = `${receptorId}|${regionId}`;
      if (!regionNode || brainRegionEdgeKeys.has(edgeKey)) return;

      allEdges.push({
        from: receptorId,
        to: regionId,
        connectionType: "brainRegion",
        system: (receptorNode.systems && receptorNode.systems[0]) || "__brain_region__",
        importance: "secondary",
      });

      brainRegionEdgeKeys.add(edgeKey);

      if (!Array.isArray(receptorNode.brainRegions)) receptorNode.brainRegions = [];
      if (!receptorNode.brainRegions.includes(regionId)) receptorNode.brainRegions.push(regionId);
      if (!regionNode.receptorIds.includes(receptorId)) regionNode.receptorIds.push(receptorId);
    });
  });

  const layoutSourcePositions = new Map();
  allNodes.forEach(node => layoutSourcePositions.set(node.id, { x: node.x, y: node.y }));

  // Visible nodes/edges (filtered)
  let visibleNodes = [];
  let visibleEdges = [];
  let synthesisChains = [];
  const mergedEdgeKeys = new Set();
  const groupedBindingEdgeKeys = new Set();
  let enzymeLabels = []; // bounding boxes for enzyme pill labels (hit-testing)

  // ── Receptor groups ────────────────────────────────────────────
  const receptorGroupData = []; // { hubLabel, members, system, color, sourceIds, hubWidth, hubHeight }

  function averagePoints(points) {
    if (!points.length) return { x: 0, y: 0 };
    let x = 0;
    let y = 0;
    points.forEach(point => {
      x += point.x;
      y += point.y;
    });
    return { x: x / points.length, y: y / points.length };
  }

  function getOrderedSystems() {
    const indexMap = new Map(SYSTEM_LAYOUT_SEQUENCE.map((id, index) => [id, index]));
    return [...encyclopedia.systems].sort((left, right) => {
      const leftIndex = indexMap.has(left.id) ? indexMap.get(left.id) : Number.MAX_SAFE_INTEGER;
      const rightIndex = indexMap.has(right.id) ? indexMap.get(right.id) : Number.MAX_SAFE_INTEGER;
      if (leftIndex !== rightIndex) return leftIndex - rightIndex;
      return left.name.localeCompare(right.name, "pl");
    });
  }

  function getRadialBasis(angle) {
    return {
      outward: { x: Math.cos(angle), y: Math.sin(angle) },
      inward: { x: -Math.cos(angle), y: -Math.sin(angle) },
      tangent: { x: -Math.sin(angle), y: Math.cos(angle) },
    };
  }

  function positionNodesOnRing(ids, radius, startAngle = -Math.PI / 2) {
    if (!ids.length) return;
    const step = (Math.PI * 2) / ids.length;
    ids.forEach((id, index) => {
      const node = nodeMap.get(id);
      if (!node) return;
      const angle = startAngle + step * index;
      node.x = Math.cos(angle) * radius;
      node.y = Math.sin(angle) * radius;
    });
  }

  function getBrainAtlasRect() {
    return {
      x: BRAIN_ATLAS_ASSET.x,
      y: BRAIN_ATLAS_ASSET.y,
      width: BRAIN_ATLAS_ASSET.width,
      height: BRAIN_ATLAS_ASSET.height,
    };
  }

  function projectBrainAtlasPoint(point) {
    const rect = getBrainAtlasRect();
    return {
      x: rect.x + rect.width * point[0],
      y: rect.y + rect.height * point[1],
    };
  }

  function layoutBrainRegionsAnatomically() {
    BRAIN_REGIONS.forEach(region => {
      const node = nodeMap.get(region.id);
      if (!node) return;

      const layout = BRAIN_REGION_ATLAS_LAYOUT[region.id];
      if (!layout) {
        node.x = region.x;
        node.y = region.y;
        delete node.labelX;
        delete node.labelY;
        delete node.anchorRadius;
        return;
      }

      const anchor = projectBrainAtlasPoint(layout.anchor);
      const label = projectBrainAtlasPoint(layout.label);
      node.x = anchor.x;
      node.y = anchor.y;
      node.labelX = label.x;
      node.labelY = label.y;
      node.width = layout.width || 132;
      node.height = layout.height || 44;
      node.anchorRadius = layout.anchorRadius || 8;
    });
  }

  function applyRadialDefaultLayout() {
    const orderedSystems = getOrderedSystems();
    const ringRadius = 1320;
    const systemCenters = new Map();
    const templateAnchors = new Map();

    orderedSystems.forEach((system, index) => {
      const angle = -Math.PI / 2 + (index / orderedSystems.length) * Math.PI * 2;
      const basis = getRadialBasis(angle);
      const anchorNodes = system.nodes.filter(node => node.type === "neurotransmitter");
      const templateSource = anchorNodes.length ? anchorNodes : system.nodes;
      templateAnchors.set(system.id, averagePoints(templateSource.map(node => ({ x: node.x, y: node.y }))));
      systemCenters.set(system.id, {
        center: { x: basis.outward.x * ringRadius, y: basis.outward.y * ringRadius },
        inward: basis.inward,
        tangent: basis.tangent,
      });
    });

    encyclopedia.systems.forEach(system => {
      const layoutMeta = systemCenters.get(system.id);
      const templateAnchor = templateAnchors.get(system.id);
      if (!layoutMeta || !templateAnchor) return;

      system.nodes.forEach(sourceNode => {
        const node = nodeMap.get(sourceNode.id);
        if (!node || SHARED_NODE_IDS.has(node.id) || node.layoutSystem !== system.id) return;

        const sourcePos = layoutSourcePositions.get(node.id) || { x: sourceNode.x, y: sourceNode.y };
        const localX = sourcePos.x - templateAnchor.x;
        const localY = sourcePos.y - templateAnchor.y;
        const tangentScale = node.type === "receptor" ? 0.9 : 0.82;
        const inwardScale = node.type === "receptor" ? 0.92 : 0.8;
        const inwardBias = node.type === "receptor"
          ? 120
          : node.type === "neurotransmitter"
            ? -28
            : 0;

        node.x = layoutMeta.center.x
          + layoutMeta.tangent.x * localX * tangentScale
          + layoutMeta.inward.x * (localY * inwardScale + inwardBias);
        node.y = layoutMeta.center.y
          + layoutMeta.tangent.y * localX * tangentScale
          + layoutMeta.inward.y * (localY * inwardScale + inwardBias);
      });
    });

    encyclopedia.sharedNodes.forEach(sourceNode => {
      const node = nodeMap.get(sourceNode.id);
      if (!node) return;

      const relatedSystems = (node.systems || []).filter(systemId => systemCenters.has(systemId));
      if (!relatedSystems.length) return;

      const templateAnchor = averagePoints(relatedSystems.map(systemId => templateAnchors.get(systemId)).filter(Boolean));
      const liveAnchor = averagePoints(relatedSystems.map(systemId => systemCenters.get(systemId).center));
      const avgAngle = Math.atan2(liveAnchor.y, liveAnchor.x);
      const basis = getRadialBasis(avgAngle);
      const sourcePos = layoutSourcePositions.get(node.id) || { x: sourceNode.x, y: sourceNode.y };
      const localX = sourcePos.x - templateAnchor.x;
      const localY = sourcePos.y - templateAnchor.y;
      const radialBlend = node.type === "catabolicEnzyme" ? 0.74 : 0.8;

      node.x = liveAnchor.x * radialBlend + basis.tangent.x * localX * 0.68 + basis.inward.x * localY * 0.68;
      node.y = liveAnchor.y * radialBlend + basis.tangent.y * localX * 0.68 + basis.inward.y * localY * 0.68;
    });

    layoutBrainRegionsAnatomically();
  }

  applyRadialDefaultLayout();

  function makeEdgeKey(edge) {
    return `${edge.from}|${edge.to}|${edge.connectionType}|${edge.system}`;
  }

  const validDegradationEdgeKeys = new Set();

  function buildValidDegradationEdgeKeys() {
    const enzymeTypes = new Set(["syntheticEnzyme", "catabolicEnzyme"]);
    const enzymeIds = new Set();
    allNodes.forEach(node => {
      if (enzymeTypes.has(node.type)) enzymeIds.add(node.id);
    });

    const incomingToEnzyme = new Map();
    const outgoingFromEnzyme = new Map();

    allEdges.forEach(edge => {
      if (edge.connectionType !== "degradation") return;

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

      incoming.forEach(inEdge => {
        outgoing.forEach(outEdge => {
          if (inEdge.system !== outEdge.system) return;
          validDegradationEdgeKeys.add(makeEdgeKey(inEdge));
          validDegradationEdgeKeys.add(makeEdgeKey(outEdge));
        });
      });
    });
  }

  buildValidDegradationEdgeKeys();

  function averagePosition(nodes) {
    return averagePoints(nodes);
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
        hubWidth: estimateHubWidth(hubLabel),
        hubHeight: 24,
          hubOffsetX: 0,
          hubOffsetY: 0,
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
  let showBrainRegions = true;
  let highlightedNodeId = null; // receptor or brain region selected for focus highlighting

  // ── Persistent node positions (localStorage) ──────────────────
  const POSITION_STORAGE_KEY = "neuroshit_node_positions_v4";

  function loadSavedPositions() {
    try {
      const saved = localStorage.getItem(POSITION_STORAGE_KEY);
      if (!saved) return;
      const positions = JSON.parse(saved);
      for (const [id, pos] of Object.entries(positions)) {
        const node = nodeMap.get(id);
        if (node && typeof pos.x === "number" && typeof pos.y === "number") {
          node.x = pos.x;
          node.y = pos.y;
          if (typeof pos.labelX === "number" && typeof pos.labelY === "number") {
            node.labelX = pos.labelX;
            node.labelY = pos.labelY;
          }
          continue;
        }

        const group = receptorGroupData.find(entry => getReceptorGroupStorageId(entry) === id);
        if (group && typeof pos.x === "number" && typeof pos.y === "number") {
          group.hubOffsetX = pos.x;
          group.hubOffsetY = pos.y;
        }
      }
    } catch (e) { /* ignore corrupt data */ }
  }

  function saveNodePositions() {
    const positions = {};
    allNodes.forEach(n => {
      positions[n.id] = { x: Math.round(n.x), y: Math.round(n.y) };
      if (typeof n.labelX === "number" && typeof n.labelY === "number") {
        positions[n.id].labelX = Math.round(n.labelX);
        positions[n.id].labelY = Math.round(n.labelY);
      }
    });
    receptorGroupData.forEach(group => {
      positions[getReceptorGroupStorageId(group)] = {
        x: Math.round(group.hubOffsetX || 0),
        y: Math.round(group.hubOffsetY || 0),
      };
    });
    localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(positions));
  }

  // Capture default positions (from medical-encyclopedia.js) BEFORE localStorage overrides
  const defaultPositions = new Map();
  allNodes.forEach(n => defaultPositions.set(n.id, {
    x: n.x,
    y: n.y,
    labelX: n.labelX,
    labelY: n.labelY,
  }));
  const defaultGroupPositions = new Map();
  receptorGroupData.forEach(group => defaultGroupPositions.set(getReceptorGroupStorageId(group), {
    x: group.hubOffsetX || 0,
    y: group.hubOffsetY || 0,
  }));

  loadSavedPositions();

  // ── System group selection state ──────────────────────────────
  let selectedSystemId = null;
  const selectedSystemNodes = new Set(); // node ids in selected system

  function selectSystem(systemId) {
    if (selectedSystemId === systemId) {
      selectedSystemId = null;
      selectedSystemNodes.clear();
    } else {
      selectedSystemId = systemId;
      selectedSystemNodes.clear();
      allNodes.forEach(n => {
        if (n.systems && n.systems.includes(systemId)) selectedSystemNodes.add(n.id);
      });
    }
    requestRender();
  }

  function clearSystemSelection() {
    selectedSystemId = null;
    selectedSystemNodes.clear();
  }

  function resetToDefaultPositions() {
    defaultPositions.forEach((pos, id) => {
      const node = nodeMap.get(id);
      if (node) {
        node.x = pos.x;
        node.y = pos.y;
        if (typeof pos.labelX === "number" && typeof pos.labelY === "number") {
          node.labelX = pos.labelX;
          node.labelY = pos.labelY;
        } else {
          delete node.labelX;
          delete node.labelY;
        }
      }
    });
    defaultGroupPositions.forEach((pos, id) => {
      const group = receptorGroupData.find(entry => getReceptorGroupStorageId(entry) === id);
      if (group) {
        group.hubOffsetX = pos.x;
        group.hubOffsetY = pos.y;
      }
    });
    localStorage.removeItem(POSITION_STORAGE_KEY);
    clearSystemSelection();
    requestRender();
  }

  function updateVisibility() {
    // A node is visible if any of its systems is active
    visibleNodes = allNodes.filter(node => {
      if (node.type === "brainRegion") return showBrainRegions;
      if (!node.systems || node.systems.length === 0) return true;
      return node.systems.some(s => activeSystems.has(s));
    });
    const visibleIds = new Set(visibleNodes.map(n => n.id));
    visibleEdges = allEdges.filter(edge => {
      if (edge.connectionType === "brainRegion") return false;
      if (!activeSystems.has(edge.system)) return false;
      if (edge.connectionType === "degradation" && !validDegradationEdgeKeys.has(makeEdgeKey(edge))) return false;
      if (groupedBindingEdgeKeys.has(makeEdgeKey(edge))) return false;
      return visibleIds.has(edge.from) && visibleIds.has(edge.to);
    });

    if (selectedSystemId && !activeSystems.has(selectedSystemId)) {
      clearSystemSelection();
    }
    if (hoveredNode && !visibleIds.has(hoveredNode.id)) {
      hoveredNode = null;
      tooltip.classList.add("hidden");
    }
    if (highlightedNodeId && !visibleIds.has(highlightedNodeId)) {
      highlightedNodeId = null;
    }

    buildSynthesisChains();
    syncPanelWithVisibility(visibleIds);

    const legendNodeCount = document.getElementById("legend-node-count");
    if (legendNodeCount) legendNodeCount.textContent = `N:${visibleNodes.length}`;
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

            mergedEdgeKeys.add(makeEdgeKey(inEdge));
            mergedEdgeKeys.add(makeEdgeKey(outEdge));
          }
        }
      }
    });

    // If a product has only one incoming chain of its type, force it to "main"
    const chainCountByProduct = new Map();
    synthesisChains.forEach(chain => {
      const key = `${chain.product.id}|${chain.chainType}`;
      chainCountByProduct.set(key, (chainCountByProduct.get(key) || 0) + 1);
    });
    synthesisChains.forEach(chain => {
      const key = `${chain.product.id}|${chain.chainType}`;
      if (chainCountByProduct.get(key) === 1) chain.importance = "main";
    });
  }

  function isEdgeMerged(edge) {
    return mergedEdgeKeys.has(makeEdgeKey(edge));
  }

  buildSynthesisChains();

  function getHighlightState(visibleIds) {
    const state = {
      active: false,
      primaryNodeId: null,
      connectedNodeIds: new Set(),
      interactionEdges: [],
      brainRegionEdges: [],
      brainPathways: [],
    };

    const highlightedNode = highlightedNodeId ? nodeMap.get(highlightedNodeId) : null;
    if (!highlightedNode || !visibleIds.has(highlightedNode.id)) return state;

    state.active = true;
    state.primaryNodeId = highlightedNode.id;
    state.connectedNodeIds.add(highlightedNode.id);

    if (highlightedNode.type === "receptor") {
      interactionEdges.forEach(edge => {
        if ((edge.from !== highlightedNode.id && edge.to !== highlightedNode.id) ||
          !visibleIds.has(edge.from) || !visibleIds.has(edge.to)) {
          return;
        }
        state.interactionEdges.push(edge);
        state.connectedNodeIds.add(edge.from);
        state.connectedNodeIds.add(edge.to);
      });
    }

    allEdges.forEach(edge => {
      if (edge.connectionType !== "brainRegion") return;
      if (!activeSystems.has(edge.system)) return;
      if (!visibleIds.has(edge.from) || !visibleIds.has(edge.to)) return;
      if (edge.from !== highlightedNode.id && edge.to !== highlightedNode.id) return;
      state.brainRegionEdges.push(edge);
      state.connectedNodeIds.add(edge.from);
      state.connectedNodeIds.add(edge.to);
    });

    if (highlightedNode.type === "brainRegion") {
      BRAIN_PATHWAYS.forEach(pathway => {
        if (!activeSystems.has(pathway.system)) return;
        if (pathway.from !== highlightedNode.id && pathway.to !== highlightedNode.id) return;
        if (!visibleIds.has(pathway.from) || !visibleIds.has(pathway.to)) return;
        state.brainPathways.push(pathway);
        state.connectedNodeIds.add(pathway.from);
        state.connectedNodeIds.add(pathway.to);
      });
    }

    return state;
  }

  // ── Hit testing for shapes ─────────────────────────────────────

  function hasBrainRegionCallout(node) {
    return node.type === "brainRegion" && typeof node.labelX === "number" && typeof node.labelY === "number";
  }

  function getNodeRenderPosition(node) {
    if (hasBrainRegionCallout(node)) {
      return { x: node.labelX, y: node.labelY };
    }
    return { x: node.x, y: node.y };
  }

  function getNodeWorldBounds(node) {
    const center = getNodeRenderPosition(node);
    const halfWidth = node.shape === "roundedRect"
      ? (node.width || 150) / 2
      : Math.max(node.radius || 0, (node.width || 0) / 2, 30);
    const halfHeight = node.shape === "roundedRect"
      ? (node.height || 44) / 2
      : Math.max(node.radius || 0, (node.height || 0) / 2, 30);

    let minX = center.x - halfWidth;
    let minY = center.y - halfHeight;
    let maxX = center.x + halfWidth;
    let maxY = center.y + halfHeight;

    if (hasBrainRegionCallout(node)) {
      const anchorRadius = node.anchorRadius || 8;
      minX = Math.min(minX, node.x - anchorRadius, center.x, node.x);
      minY = Math.min(minY, node.y - anchorRadius, center.y, node.y);
      maxX = Math.max(maxX, node.x + anchorRadius, center.x, node.x);
      maxY = Math.max(maxY, node.y + anchorRadius, center.y, node.y);
    }

    return { minX, minY, maxX, maxY };
  }

  function setNodeRenderPosition(node, nextX, nextY) {
    if (hasBrainRegionCallout(node)) {
      node.labelX = nextX;
      node.labelY = nextY;
      return;
    }

    node.x = nextX;
    node.y = nextY;
  }

  function setNodeAnchorPosition(node, nextX, nextY) {
    node.x = nextX;
    node.y = nextY;
  }

  function hitTestBrainRegionAnchor(node, wx, wy) {
    if (!hasBrainRegionCallout(node)) return false;
    const anchorRadius = (node.anchorRadius || 8) + 5;
    return Math.hypot(wx - node.x, wy - node.y) <= anchorRadius;
  }

  function hitTestNode(node, wx, wy) {
    const center = getNodeRenderPosition(node);
    const dx = wx - center.x;
    const dy = wy - center.y;
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

  function getShapeRadius(node, angle, options = {}) {
    if (!options.useRenderedShape && hasBrainRegionCallout(node)) {
      return node.anchorRadius || 8;
    }

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

  function mixHexColors(left, right, ratio) {
    const clampRatio = Math.max(0, Math.min(1, ratio));
    const leftR = parseInt(left.slice(1, 3), 16);
    const leftG = parseInt(left.slice(3, 5), 16);
    const leftB = parseInt(left.slice(5, 7), 16);
    const rightR = parseInt(right.slice(1, 3), 16);
    const rightG = parseInt(right.slice(3, 5), 16);
    const rightB = parseInt(right.slice(5, 7), 16);
    const mixedR = Math.round(leftR + (rightR - leftR) * clampRatio);
    const mixedG = Math.round(leftG + (rightG - leftG) * clampRatio);
    const mixedB = Math.round(leftB + (rightB - leftB) * clampRatio);
    return `#${mixedR.toString(16).padStart(2, "0")}${mixedG.toString(16).padStart(2, "0")}${mixedB.toString(16).padStart(2, "0")}`;
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

  function getSystemNodeColor(nodeType, systemColor) {
    switch (nodeType) {
      case "syntheticEnzyme":
        return mixHexColors(systemColor, "#ffffff", 0.18);
      case "catabolicEnzyme":
        return mixHexColors(systemColor, "#0f172a", 0.18);
      case "precursor":
        return mixHexColors(systemColor, "#ffffff", 0.28);
      case "metabolite":
        return mixHexColors(systemColor, "#94a3b8", 0.42);
      case "transporter":
        return mixHexColors(systemColor, "#22d3ee", 0.24);
      default:
        return systemColor;
    }
  }

  function getSystemColor(systemId, fallback = "#94a3b8") {
    const system = SYSTEM_META_BY_ID.get(systemId);
    return system && system.color ? system.color : fallback;
  }

  function getReceptorGroupStorageId(group) {
    return `group:${group.system}:${group.hubLabel}`;
  }

  function hashString(value) {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
      hash = ((hash << 5) - hash) + value.charCodeAt(index);
      hash |= 0;
    }
    return Math.abs(hash);
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
  const brainAtlasImage = new Image();

  let W, H;
  let camera = { x: 0, y: 0, zoom: 0.45 };
  let targetCamera = { x: 0, y: 0, zoom: 0.45 };
  const LERP = 0.15;
  let frameHandle = 0;
  let brainAtlasImageReady = false;

  brainAtlasImage.decoding = "async";
  brainAtlasImage.addEventListener("load", () => {
    brainAtlasImageReady = true;
    requestRender();
  });
  brainAtlasImage.addEventListener("error", () => {
    brainAtlasImageReady = false;
  });
  brainAtlasImage.src = BRAIN_ATLAS_ASSET.src;

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
      const bounds = getNodeWorldBounds(n);
      minX = Math.min(minX, bounds.minX);
      minY = Math.min(minY, bounds.minY);
      maxX = Math.max(maxX, bounds.maxX);
      maxY = Math.max(maxY, bounds.maxY);
    });
    if (showBrainRegions) {
      const rect = getBrainAtlasRect();
      minX = Math.min(minX, rect.x);
      minY = Math.min(minY, rect.y);
      maxX = Math.max(maxX, rect.x + rect.width);
      maxY = Math.max(maxY, rect.y + rect.height);
    }
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

    drawBrainAtlasBackground();

    const visibleIds = new Set(visibleNodes.map(n => n.id));
    const highlightState = getHighlightState(visibleIds);

    visibleEdges.forEach(edge => { if (!isEdgeMerged(edge)) drawEdge(edge); });
    synthesisChains.forEach(chain => {
      if (activeSystems.has(chain.system)) drawSynthesisChain(chain);
    });

    // Draw receptor interactions
    if (showAllInteractions) {
      interactionEdges.forEach(edge => {
        if (visibleIds.has(edge.from) && visibleIds.has(edge.to)) {
          drawEdge(edge);
        }
      });
    }

    highlightState.interactionEdges.forEach(edge => drawHighlightedEdge(edge));
    highlightState.brainRegionEdges.forEach(edge => drawHighlightedEdge(edge));
    highlightState.brainPathways.forEach(pathway => drawBrainPathway(pathway));

    // Draw receptor group hubs and subtype branches
    drawReceptorGroups();
    drawBrainRegionCallouts();

    visibleNodes.forEach(node => {
      if (node.renderAsLabel) return; // enzyme nodes rendered as pill labels
      drawNode(node, node === hoveredNode);
    });

    if (highlightState.active) {
      highlightState.connectedNodeIds.forEach(nodeId => {
        const node = nodeMap.get(nodeId);
        if (!node || !visibleIds.has(nodeId) || node.renderAsLabel) return;
        drawNodeHighlight(node, nodeId === highlightState.primaryNodeId);
      });
    }

    // Draw system selection rings (above nodes)
    if (selectedSystemNodes.size > 0) {
      const t = Date.now() / 1000;
      visibleNodes.forEach(node => {
        if (!selectedSystemNodes.has(node.id) || node.renderAsLabel) return;
        const r = (node.radius || 20) + 10;
        const center = getNodeRenderPosition(node);
        ctx.save();
        ctx.beginPath();
        ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
        // Animated dashed ring
        ctx.setLineDash([5, 4]);
        ctx.lineDashOffset = -t * 18;
        ctx.strokeStyle = "rgba(74, 222, 128, 0.75)";
        ctx.lineWidth = 1.5;
        ctx.shadowColor = "#4ade80";
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.restore();
      });
    }

    ctx.restore();

    document.getElementById("zoomLevel").textContent = `${Math.round(camera.zoom * 100)}%`;

    // HUD indicator
    const showHUD = isAltDown || isDraggingNode || selectedSystemNodes.size > 0;
    if (showHUD) {
      ctx.save();
      ctx.font = "bold 12px 'Fira Code', monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";

      let msg, accentColor;
      if (isDraggingGroup) {
        msg = `✥ PRZESUWANIE GRUPY (${selectedSystemNodes.size} węzłów)...`;
        accentColor = "rgba(74, 222, 128, 0.7)";
      } else if (isDraggingNode) {
        msg = "✥ PRZESUWANIE WĘZŁA...";
        accentColor = "rgba(96, 165, 250, 0.7)";
      } else if (selectedSystemNodes.size > 0 && isAltDown) {
        msg = `✥ TRYB GRUPY · ${selectedSystemNodes.size} węzłów — Alt+drag aby przesunąć`;
        accentColor = "rgba(74, 222, 128, 0.7)";
      } else if (selectedSystemNodes.size > 0) {
        msg = `✥ SYSTEM ZAZNACZONY · ${selectedSystemNodes.size} węzłów — Alt+drag przesuwa grupę · Esc odznacza`;
        accentColor = "rgba(74, 222, 128, 0.6)";
      } else {
        msg = "✥ TRYB PRZESUWANIA — kliknij węzeł";
        accentColor = "rgba(96, 165, 250, 0.6)";
      }

      const tw = ctx.measureText(msg).width;
      const px = 12, py = H - 20, ph = 22, pw = tw + 20;
      ctx.fillStyle = "rgba(4, 8, 18, 0.92)";
      drawRoundedRect(px, py - ph / 2, pw, ph, 0);
      ctx.fill();
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 1;
      drawRoundedRect(px, py - ph / 2, pw, ph, 0);
      ctx.stroke();
      ctx.fillStyle = accentColor.replace(/[\d.]+\)$/, "0.95)");
      ctx.fillText(msg, px + 10, py);
      ctx.restore();
    }

    drawMinimap();
    return cameraAnimating || selectedSystemNodes.size > 0;
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

  function drawBrainAtlasBackground() {
    if (!showBrainRegions) return;

    const rect = getBrainAtlasRect();
    const glowX = rect.x + rect.width * 0.47;
    const glowY = rect.y + rect.height * 0.46;

    ctx.save();
    const glow = ctx.createRadialGradient(glowX, glowY, rect.width * 0.06, glowX, glowY, rect.width * 0.62);
    glow.addColorStop(0, "rgba(56, 189, 248, 0.12)");
    glow.addColorStop(0.55, "rgba(14, 165, 233, 0.05)");
    glow.addColorStop(1, "rgba(14, 165, 233, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(glowX, glowY, rect.width * 0.54, rect.height * 0.42, -0.08, 0, Math.PI * 2);
    ctx.fill();

    if (brainAtlasImageReady) {
      ctx.globalAlpha = 0.28;
      ctx.drawImage(brainAtlasImage, rect.x, rect.y, rect.width, rect.height);
    }
    ctx.restore();
  }

  function drawBrainRegionCallouts() {
    if (!showBrainRegions) return;

    visibleNodes.forEach(node => {
      if (!hasBrainRegionCallout(node)) return;

      const center = getNodeRenderPosition(node);
      const direction = normalizeVector(node.x - center.x, node.y - center.y);
      const isHovered = hoveredNode && hoveredNode.id === node.id;
      const anchorRadius = node.anchorRadius || 8;

      if (direction && direction.len > 18) {
        const angle = Math.atan2(node.y - center.y, node.x - center.x);
        const labelRadius = getShapeRadius(node, angle, { useRenderedShape: true });
        const startX = center.x + direction.x * labelRadius;
        const startY = center.y + direction.y * labelRadius;
        const endX = node.x - direction.x * anchorRadius;
        const endY = node.y - direction.y * anchorRadius;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = hexToRgba(node.color, isHovered ? 0.82 : 0.48);
        ctx.lineWidth = isHovered ? 2 : 1.3;
        ctx.shadowColor = hexToRgba(node.color, isHovered ? 0.28 : 0.16);
        ctx.shadowBlur = isHovered ? 10 : 4;
        ctx.stroke();
        ctx.restore();
      }

      if ((direction && direction.len > 18) || isHovered) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(node.x, node.y, anchorRadius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(3, 10, 20, 0.92)";
        ctx.fill();
        ctx.strokeStyle = hexToRgba(node.color, isHovered ? 0.95 : 0.72);
        ctx.lineWidth = isHovered ? 2 : 1.25;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(node.x, node.y, Math.max(2.5, anchorRadius - 4.5), 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(node.color, isHovered ? 0.58 : 0.34);
        ctx.fill();
        ctx.restore();
      }
    });
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
      style.color = style.color.replace(/rgba\(([^,]+,[^,]+,[^,]+),\s*[\d.]+\)/, "rgba($1, 0.4)");
      style.lineWidth = style.lineWidth * 0.75;
    }

    drawConnectionBetweenNodes(fromNode, toNode, style);
  }

  function drawHighlightedEdge(edge) {
    const fromNode = nodeMap.get(edge.from);
    const toNode = nodeMap.get(edge.to);
    if (!fromNode || !toNode) return;

    const style = { ...getConnectionStyle(edge.connectionType) };
    if (edge.connectionType === "receptorInteraction") {
      style.color = "rgba(251, 191, 36, 0.96)";
      style.lineWidth = 2.5;
      style.dash = [7, 3];
      style.curvature = 28;
      style.arrowInset = 8;
      style.arrowSize = 7;
    } else if (edge.connectionType === "brainRegion") {
      const accentColor = fromNode.systemColor || getSystemColor(edge.system, fromNode.color || "#38bdf8");
      style.color = hexToRgba(accentColor, 0.94);
      style.lineWidth = 2.15;
      style.dash = [6, 4];
      style.curvature = 24;
      style.arrowInset = 8;
      style.arrowSize = 7;
    }

    ctx.save();
    ctx.shadowColor = edge.connectionType === "brainRegion"
      ? hexToRgba(fromNode.systemColor || getSystemColor(edge.system, fromNode.color || "#38bdf8"), 0.34)
      : "rgba(251, 191, 36, 0.34)";
    ctx.shadowBlur = 12;
    drawConnectionBetweenNodes(fromNode, toNode, style, { showLabel: false });
    ctx.restore();
  }

  function drawBrainPathway(pathway) {
    const fromNode = nodeMap.get(pathway.from);
    const toNode = nodeMap.get(pathway.to);
    if (!fromNode || !toNode) return;

    const pathwayColor = getSystemColor(pathway.system, "#38bdf8");
    const curvatureSeed = (hashString(pathway.id || `${pathway.from}:${pathway.to}`) % 3) - 1;
    const curvature = curvatureSeed === 0 ? 18 : curvatureSeed * 22;
    const style = {
      ...CONNECTION_TYPES.brainRegion,
      color: hexToRgba(pathwayColor, 0.92),
      lineWidth: 2.35,
      dash: [10, 5],
      curvature,
      arrowInset: 8,
      arrowSize: 8,
    };

    ctx.save();
    ctx.shadowColor = hexToRgba(pathwayColor, 0.34);
    ctx.shadowBlur = 12;
    const geometry = drawConnectionBetweenNodes(fromNode, toNode, style, { showLabel: false, curvature });
    ctx.restore();

    if (!geometry || camera.zoom < 0.48) return;

    const labelText = pathway.label || pathway.signal || "Pathway";
    const midX = (geometry.startX + geometry.tipX) * 0.5;
    const midY = (geometry.startY + geometry.tipY) * 0.5;
    const labelX = midX + geometry.px * (curvature * 0.35);
    const labelY = midY + geometry.py * (curvature * 0.35);
    drawEdgeLabel(labelText, labelX, labelY, hexToRgba(pathwayColor, 0.98));
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
      style.color = style.color.replace(/rgba\(([^,]+,[^,]+,[^,]+),\s*[\d.]+\)/, "rgba($1, 0.4)");
      style.lineWidth = style.lineWidth * 0.75;
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
    let worstExcess = 0;
    let worstSide = 0;
    for (const node of visibleNodes) {
      if (node.id === substrate.id || node.id === product.id || node.id === enzyme.id) continue;
      if (node.renderAsLabel) continue;
      const t = Math.max(0, Math.min(1, ((node.x - startX) * dx + (node.y - startY) * dy) / (len * len)));
      if (t <= 0.1 || t >= 0.9) continue;
      const closestX = startX + t * dx;
      const closestY = startY + t * dy;
      const dist = Math.sqrt((node.x - closestX) ** 2 + (node.y - closestY) ** 2);
      const nodeR = Math.max(node.radius || 0, (node.width || 0) / 2, 20);
      const excess = nodeR + checkMargin - dist;
      if (excess > 0) {
        needsCurve = true;
        if (excess > worstExcess) {
          worstExcess = excess;
          worstSide = (node.x - startX) * perp.x + (node.y - startY) * perp.y;
        }
      }
    }
    if (needsCurve) {
      curveOffset = (worstSide > 0 ? -1 : 1) * Math.min(worstExcess + 20, 120);
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
      if (chain.importance === "secondary") {
        ctx.save();
        ctx.globalAlpha = (ctx.globalAlpha || 1) * 0.65;
        drawEdgeLabel(enzymeName, lx, ly, labelColor);
        ctx.restore();
      } else {
        drawEdgeLabel(enzymeName, lx, ly, labelColor);
      }

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

  function getReceptorGroupHubBaseNode(group, memberNodes, sourceNodes) {
    const memberCenter = averagePosition(memberNodes);
    const sourceCenter = averagePosition(sourceNodes);
    const dx = memberCenter.x - sourceCenter.x;
    const dy = memberCenter.y - sourceCenter.y;
    const dist = Math.max(1, Math.hypot(dx, dy));
    const hubOffset = Math.min(76, Math.max(42, dist * 0.34));

    return {
      id: `group:${group.system}:${group.hubLabel}`,
      x: memberCenter.x - (dx / dist) * hubOffset,
      y: memberCenter.y - (dy / dist) * hubOffset,
      shape: "roundedRect",
      width: group.hubWidth,
      height: group.hubHeight,
    };
  }

  function getReceptorGroupHubNode(group, memberNodes, sourceNodes) {
    const baseNode = getReceptorGroupHubBaseNode(group, memberNodes, sourceNodes);
    return {
      ...baseNode,
      x: baseNode.x + (group.hubOffsetX || 0),
      y: baseNode.y + (group.hubOffsetY || 0),
    };
  }

  function getVisibleReceptorGroupHubs() {
    const hubs = [];
    receptorGroupData.forEach(group => {
      if (!activeSystems.has(group.system)) return;

      const memberNodes = group.members.map(id => nodeMap.get(id)).filter(Boolean);
      if (memberNodes.length < 2) return;
      const sourceNodes = group.sourceIds.map(id => nodeMap.get(id)).filter(Boolean);
      if (!sourceNodes.length) return;

      hubs.push({
        group,
        memberNodes,
        sourceNodes,
        baseHubNode: getReceptorGroupHubBaseNode(group, memberNodes, sourceNodes),
        hubNode: getReceptorGroupHubNode(group, memberNodes, sourceNodes),
      });
    });
    return hubs;
  }

  function drawReceptorGroups() {
    getVisibleReceptorGroupHubs().forEach(({ group, memberNodes, sourceNodes, hubNode }) => {

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

      sourceNodes.forEach(sourceNode => {
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

  function drawNodeHighlight(node, isPrimary) {
    if (node.renderAsLabel) return;

    const renderPos = getNodeRenderPosition(node);
    const renderNode = renderPos.x === node.x && renderPos.y === node.y
      ? node
      : { ...node, x: renderPos.x, y: renderPos.y };
    const projectedSize = Math.max(
      (renderNode.radius || 24) * camera.zoom * 2,
      (renderNode.width || 0) * camera.zoom,
      (renderNode.height || 0) * camera.zoom
    );
    const lowDetail = projectedSize < 18;
    const glowRadius = Math.max(
      (renderNode.radius || 24) + (isPrimary ? 18 : 10),
      ((renderNode.width || 0) * 0.5) + (isPrimary ? 18 : 10),
      ((renderNode.height || 0) * 0.5) + (isPrimary ? 16 : 8)
    );

    if (!lowDetail) {
      const glow = ctx.createRadialGradient(renderNode.x, renderNode.y, glowRadius * 0.25, renderNode.x, renderNode.y, glowRadius * 1.2);
      glow.addColorStop(0, hexToRgba(renderNode.color, isPrimary ? 0.2 : 0.1));
      glow.addColorStop(0.6, hexToRgba(renderNode.color, isPrimary ? 0.08 : 0.04));
      glow.addColorStop(1, hexToRgba(renderNode.color, 0));
      ctx.save();
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(renderNode.x, renderNode.y, glowRadius * 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const pad = isPrimary ? 8 : 5;
    ctx.save();
    ctx.strokeStyle = hexToRgba(renderNode.color, isPrimary ? 0.98 : 0.8);
    ctx.lineWidth = isPrimary ? 2.8 : 2;
    ctx.shadowColor = hexToRgba(renderNode.color, isPrimary ? 0.46 : 0.26);
    ctx.shadowBlur = lowDetail ? 0 : (isPrimary ? 16 : 8);

    switch (renderNode.shape) {
      case "roundedRect": {
        const w = (renderNode.width || 150) + pad * 2;
        const h = (renderNode.height || 44) + pad * 2;
        drawRoundedRect(renderNode.x - w / 2, renderNode.y - h / 2, w, h, 8 + pad * 0.45);
        ctx.stroke();
        break;
      }
      case "hexagon": {
        drawHexagonPath(renderNode.x, renderNode.y, (renderNode.radius || 30) + pad);
        ctx.stroke();
        break;
      }
      case "diamond": {
        drawDiamondPath(renderNode.x, renderNode.y, (renderNode.radius || 32) + pad);
        ctx.stroke();
        break;
      }
      default: {
        ctx.beginPath();
        ctx.arc(renderNode.x, renderNode.y, (renderNode.radius || 24) + pad, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }
    }

    ctx.restore();
  }

  function drawNode(node, isHovered) {
    // Skip enzyme nodes — they're rendered as pill labels on arrows
    if (node.renderAsLabel) return;

    const renderPos = getNodeRenderPosition(node);
    const renderNode = renderPos.x === node.x && renderPos.y === node.y
      ? node
      : { ...node, x: renderPos.x, y: renderPos.y };

    const pulse = 0;
    const projectedSize = Math.max(
      (renderNode.radius || 24) * camera.zoom * 2,
      (renderNode.width || 0) * camera.zoom,
      (renderNode.height || 0) * camera.zoom
    );
    const lowDetail = projectedSize < 18;

    // Hover glow
    if (isHovered && !lowDetail) {
      const glowR = (renderNode.radius || 30) * 2.5;
      const grad = ctx.createRadialGradient(renderNode.x, renderNode.y, glowR * 0.2, renderNode.x, renderNode.y, glowR);
      grad.addColorStop(0, `${renderNode.color}40`);
      grad.addColorStop(1, `${renderNode.color}00`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(renderNode.x, renderNode.y, glowR, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.save();
    ctx.shadowColor = hexToRgba(renderNode.color, isHovered ? 0.5 : 0.24);
    ctx.shadowBlur = lowDetail ? 0 : (isHovered ? 20 : 10);

    switch (renderNode.shape) {
      case "roundedRect":
        drawRectNode(renderNode, isHovered, pulse, lowDetail);
        break;
      case "hexagon":
        drawHexNode(renderNode, isHovered, pulse, lowDetail);
        break;
      case "diamond":
        drawDiamondNode(renderNode, isHovered, pulse, lowDetail);
        break;
      default:
        drawCircleNode(renderNode, isHovered, pulse, lowDetail);
        break;
    }

    ctx.restore();

    // Label
    drawNodeLabel(renderNode);
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
    const fontSize = node.type === "brainRegion" ? 9 :
      node.shape === "roundedRect" ? 10 :
        node.type === "neurotransmitter" ? 11 :
          isGrouped ? 8 :
            isSmall ? 8 : 9;

    ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
    ctx.fillStyle = "#f1f5f9";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // For grouped receptors, show only the distinguishing part
    let displayLabel = node.displayLabel || node.label;
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

  function hitTestGroupHub(hubNode, wx, wy) {
    return Math.abs(wx - hubNode.x) <= (hubNode.width || 56) * 0.5 + 4
      && Math.abs(wy - hubNode.y) <= (hubNode.height || 24) * 0.5 + 4;
  }

  function findDraggableTarget(wx, wy) {
    for (const node of visibleNodes) {
      if (node.renderAsLabel) continue;
      if (hitTestBrainRegionAnchor(node, wx, wy)) {
        return { kind: "brainRegionAnchor", node };
      }
    }

    if (camera.zoom >= 0.16) {
      for (const hubEntry of getVisibleReceptorGroupHubs()) {
        if (hitTestGroupHub(hubEntry.hubNode, wx, wy)) {
          return { kind: "groupHub", ...hubEntry };
        }
      }
    }

    for (const node of visibleNodes) {
      if (node.renderAsLabel) continue;
      if (!hitTestNode(node, wx, wy)) continue;
      if (hasBrainRegionCallout(node)) return { kind: "brainRegionLabel", node };
      return { kind: "node", node };
    }

    for (const el of enzymeLabels) {
      if (wx >= el.x && wx <= el.x + el.w && wy >= el.y && wy <= el.y + el.h) {
        return { kind: "node", node: el.node };
      }
    }

    return null;
  }


  // ── Interaction: Pan / Zoom / Node Drag ───────────────────────

  let isPanning = false;
  let isRightZooming = false;
  let panStart = { x: 0, y: 0 };
  let rightZoomStartY = 0;
  let lastMouse = { canvasX: 0, canvasY: 0, clientX: 0, clientY: 0 };

  // Node dragging state
  let isDraggingNode = false;
  let isDraggingGroup = false;
  let draggedNode = null;
  let draggedGroup = null;
  let draggedGroupBaseNode = null;
  let dragTargetKind = "node";
  let groupDragOffsets = new Map(); // id → { dx, dy }
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let dragHasMoved = false;
  let suppressNextClick = false;
  let isAltDown = false;
  let panHasMoved = false;
  let rightZoomHasMoved = false;

  window.addEventListener("keydown", e => {
    if (e.key === "Alt") { isAltDown = true; e.preventDefault(); requestRender(); }
  });
  window.addEventListener("keyup", e => {
    if (e.key === "Alt") { isAltDown = false; requestRender(); }
  });

  container.addEventListener("contextmenu", e => e.preventDefault());

  container.addEventListener("mousedown", e => {
    const point = getCanvasPoint(e.clientX, e.clientY);
    lastMouse.canvasX = point.x;
    lastMouse.canvasY = point.y;
    lastMouse.clientX = e.clientX;
    lastMouse.clientY = e.clientY;

    // Alt + left click = drag node
    if (e.button === 0 && e.altKey) {
      const world = screenToWorld(point.x, point.y);
      const target = findDraggableTarget(world.x, world.y);
      if (target) {
        const targetPos = target.kind === "brainRegionAnchor"
          ? { x: target.node.x, y: target.node.y }
          : target.kind === "groupHub"
            ? { x: target.hubNode.x, y: target.hubNode.y }
            : getNodeRenderPosition(target.node);
        isDraggingNode = true;
        dragTargetKind = target.kind;
        draggedNode = target.node || null;
        draggedGroup = target.group || null;
        draggedGroupBaseNode = target.baseHubNode || null;
        dragOffsetX = world.x - targetPos.x;
        dragOffsetY = world.y - targetPos.y;
        // Group drag if target belongs to the selected system
        if (target.kind === "node" && target.node && selectedSystemNodes.has(target.node.id) && selectedSystemNodes.size > 1) {
          isDraggingGroup = true;
          groupDragOffsets.clear();
          selectedSystemNodes.forEach(id => {
            const n = nodeMap.get(id);
            if (n) groupDragOffsets.set(id, { dx: world.x - n.x, dy: world.y - n.y });
          });
        } else {
          isDraggingGroup = false;
          groupDragOffsets.clear();
        }
        dragHasMoved = false;
        e.preventDefault();
        return;
      }
    }

    if (e.button === 0) {
      isPanning = true;
      panHasMoved = false;
      panStart.x = e.clientX;
      panStart.y = e.clientY;
    }
    if (e.button === 2) {
      isRightZooming = true;
      rightZoomHasMoved = false;
      rightZoomStartY = e.clientY;
      container.classList.add("is-right-zooming");
    }
  });

  window.addEventListener("mousemove", e => {
    const point = getCanvasPoint(e.clientX, e.clientY);
    lastMouse.canvasX = point.x;
    lastMouse.canvasY = point.y;
    lastMouse.clientX = e.clientX;
    lastMouse.clientY = e.clientY;

    if (isDraggingNode && (draggedNode || draggedGroup)) {
      const world = screenToWorld(point.x, point.y);
      if (dragTargetKind === "groupHub" && draggedGroup && draggedGroupBaseNode) {
        draggedGroup.hubOffsetX = Math.round(world.x - dragOffsetX - draggedGroupBaseNode.x);
        draggedGroup.hubOffsetY = Math.round(world.y - dragOffsetY - draggedGroupBaseNode.y);
      } else if (isDraggingGroup) {
        groupDragOffsets.forEach((off, id) => {
          const n = nodeMap.get(id);
          if (n) { n.x = Math.round(world.x - off.dx); n.y = Math.round(world.y - off.dy); }
        });
      } else if (dragTargetKind === "brainRegionAnchor" && draggedNode) {
        setNodeAnchorPosition(
          draggedNode,
          Math.round(world.x - dragOffsetX),
          Math.round(world.y - dragOffsetY)
        );
      } else {
        setNodeRenderPosition(
          draggedNode,
          Math.round(world.x - dragOffsetX),
          Math.round(world.y - dragOffsetY)
        );
      }
      dragHasMoved = true;
      requestRender();
      return;
    }

    if (isRightZooming) {
      const dy = e.clientY - rightZoomStartY;
      if (dy !== 0) {
        rightZoomHasMoved = true;
        zoomAt(lastMouse.canvasX, lastMouse.canvasY, Math.exp(-dy * 0.01));
        rightZoomStartY = e.clientY;
      }
      return;
    }
    if (isPanning) {
      if (e.clientX !== panStart.x || e.clientY !== panStart.y) panHasMoved = true;
      targetCamera.x -= (e.clientX - panStart.x) / camera.zoom;
      targetCamera.y -= (e.clientY - panStart.y) / camera.zoom;
      panStart.x = e.clientX; panStart.y = e.clientY;
      requestRender();
      return;
    }
    updateHover(point.x, point.y, e.clientX, e.clientY);
  });

  window.addEventListener("mouseup", e => {
    if (e.button === 0) {
      if (isDraggingNode) {
        if (dragHasMoved) {
          saveNodePositions();
          suppressNextClick = true;
        }
        isDraggingNode = false;
        isDraggingGroup = false;
        draggedNode = null;
        draggedGroup = null;
        draggedGroupBaseNode = null;
        dragTargetKind = "node";
        groupDragOffsets.clear();
        requestRender();
      }
      if (isPanning && panHasMoved) suppressNextClick = true;
      isPanning = false;
    }
    if (e.button === 2) { isRightZooming = false; container.classList.remove("is-right-zooming"); }
  });

  window.addEventListener("blur", () => {
    isPanning = false;
    isRightZooming = false;
    isDraggingNode = false;
    isDraggingGroup = false;
    draggedNode = null;
    draggedGroup = null;
    draggedGroupBaseNode = null;
    dragTargetKind = "node";
    container.classList.remove("is-right-zooming");
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

  const TYPE_LABELS = {
    neurotransmitter: "Neuroprzekaźnik",
    syntheticEnzyme: "Enzym syntezy",
    catabolicEnzyme: "Enzym degradacji",
    receptor: "Receptor",
    transporter: "Transporter",
    precursor: "Prekursor",
    metabolite: "Metabolit",
    brainRegion: "Część mózgu",
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

    if (!closest && isAltDown) {
      const dragTarget = findDraggableTarget(world.x, world.y);
      if (dragTarget) {
        container.style.cursor = "move";
        tooltip.classList.add("hidden");
        return;
      }
    }

    if (closest) {
      container.style.cursor = isAltDown ? "move" : "pointer";
      tooltip.querySelector(".tt-type").textContent = (TYPE_LABELS[closest.type] || closest.type).toUpperCase();
      tooltip.querySelector(".tt-type").style.color = closest.color;
      tooltip.querySelector(".tt-title").textContent = closest.label.replace(/\n/g, ' ');
      const tooltipBits = [
        closest.formula ? `<span style="color:#22d3ee">${closest.formula}</span>` : "",
        closest.type === "brainRegion" && closest.receptorIds && closest.receptorIds.length
          ? `${closest.receptorIds.length} receptorów`
          : "",
        (closest.description || "").split("\n")[0]
      ].filter(Boolean);
      tooltip.querySelector(".tt-desc").innerHTML = tooltipBits.join(" · ");
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

  container.addEventListener("click", e => {
    if (suppressNextClick) { suppressNextClick = false; return; }
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
      // System group selection: click neurotransmitter to select/deselect its whole system
      if (clicked.type === "neurotransmitter") {
        const sysId = clicked.systems && clicked.systems[0];
        if (sysId) selectSystem(sysId);
      }
      if (clicked.type === "receptor" || clicked.type === "brainRegion") {
        highlightedNodeId = highlightedNodeId === clicked.id ? null : clicked.id;
      }
    } else {
      clearSystemSelection();
      highlightedNodeId = null;
    }
    requestRender();
  });

  document.getElementById("close-panel").addEventListener("click", () => {
    panelNodeId = null;
    infoPanel.classList.add("hidden");
    requestRender();
  });

  function showPanel(node) {
    panelNodeId = node.id;
    const typeLabel = (TYPE_LABELS[node.type] || node.type).toUpperCase();
    const visibleIds = new Set(visibleNodes.map(n => n.id));
    const brainRegionLinks = allEdges.filter(edge => {
      if (edge.connectionType !== "brainRegion") return false;
      if (!activeSystems.has(edge.system)) return false;
      if (!visibleIds.has(edge.from) || !visibleIds.has(edge.to)) return false;
      return edge.from === node.id || edge.to === node.id;
    });
    const brainPathwayLinks = BRAIN_PATHWAYS.filter(pathway => {
      if (!activeSystems.has(pathway.system)) return false;
      return pathway.from === node.id || pathway.to === node.id;
    });

    // Update dossier header
    const dossierLabel = document.getElementById("panel-dossier-label");
    const dossierMeta = document.getElementById("panel-dossier-meta");
    if (dossierLabel) dossierLabel.textContent = `DOSSIER // ${typeLabel}`;
    if (dossierMeta) {
      dossierMeta.textContent = node.type === "brainRegion"
        ? "LAYER:REGIONY"
        : (node.systemName ? `SYS:${node.systemName.toUpperCase()}` : "SYS:—");
    }

    // Title + type tag
    panelTitle.textContent = node.label.replace(/\n/g, ' ');
    panelTitle.style.color = node.color;

    const typeTag = document.getElementById("panel-type-tag");
    if (typeTag) {
      typeTag.textContent = typeLabel;
      typeTag.style.color = node.color;
      typeTag.style.borderColor = hexToRgba(node.color, 0.4);
      typeTag.style.background = hexToRgba(node.color, 0.1);
    }

    let html = "";

    const sec = (title, content) =>
      `<div class="detail-section"><h3>${title}</h3><p>${content}</p></div>`;

    if (node.formula) {
      html += sec("Wzór / Struktura", `<span style="color:#22d3ee;font-family:var(--font-mono)">${node.formula}</span>`);
    }

    if (node.description) {
      html += sec("Opis", node.description.split("\n").join("<br>"));
    }

    if (node.type === "receptor" && brainRegionLinks.length) {
      const regionTags = brainRegionLinks.map(edge => {
        const regionNode = nodeMap.get(edge.to);
        const regionLabel = regionNode ? regionNode.label.replace(/\n/g, " ") : edge.to;
        return `<span class="tag" style="background:rgba(56,189,248,0.12);color:#38bdf8;border-color:rgba(56,189,248,0.35)">${regionLabel}</span>`;
      });
      html += sec(`Części mózgu (${regionTags.length})`, regionTags.join(" "));
    }

    if (node.type === "brainRegion" && brainRegionLinks.length) {
      const receptorTags = brainRegionLinks.map(edge => {
        const receptorNode = nodeMap.get(edge.from);
        const receptorLabel = receptorNode ? receptorNode.label.replace(/\n/g, " ") : edge.from;
        const receptorColor = receptorNode ? (receptorNode.systemColor || receptorNode.color) : "#c084fc";
        const systemMeta = receptorNode && receptorNode.systemName
          ? ` <span style="color:#64748b;font-size:9px">${receptorNode.systemName}</span>`
          : "";
        return `<span class="tag" style="background:${hexToRgba(receptorColor, 0.12)};color:${receptorColor};border-color:${hexToRgba(receptorColor, 0.35)}">${receptorLabel}</span>${systemMeta}`;
      });
      html += sec(`Receptory w regionie (${receptorTags.length})`, receptorTags.join(" "));
    }

    if (node.type === "brainRegion" && brainPathwayLinks.length) {
      const pathwayRows = brainPathwayLinks.map(pathway => {
        const fromNode = nodeMap.get(pathway.from);
        const toNode = nodeMap.get(pathway.to);
        const fromLabel = fromNode ? fromNode.label.replace(/\n/g, " ") : pathway.from;
        const toLabel = toNode ? toNode.label.replace(/\n/g, " ") : pathway.to;
        const systemMeta = SYSTEM_META_BY_ID.get(pathway.system);
        const systemColor = systemMeta ? systemMeta.color : "#38bdf8";
        const systemLabel = systemMeta ? systemMeta.name : "Szlak regionalny";
        const signalLabel = pathway.signal ? `SIG: ${pathway.signal}` : "SIG: modulacja";
        return `<span class="tag" style="background:${hexToRgba(systemColor, 0.12)};color:${systemColor};border-color:${hexToRgba(systemColor, 0.35)}">${pathway.label}</span> ${fromLabel} → ${toLabel}<br><span style="color:#94a3b8">${signalLabel} · ${pathway.description}</span><br><span style="color:#64748b;font-size:9px">${systemLabel}</span>`;
      });
      html += sec(`Pathways sygnałowe (${brainPathwayLinks.length})`, pathwayRows.join("<br><br>"));
    }

    // Receptor extended info
    if (node.type === "receptor") {
      if (node.gProtein) html += sec("Białko G / Mechanizm", node.gProtein);
      if (node.signaling) html += sec("Sygnalizacja", node.signaling);
      if (node.functions && node.functions.length) html += sec("Funkcje", node.functions.join(", "));
      if (node.activationEffects) {
        html += sec("Efekty aktywacji", `<span style="color:#4ade80">${node.activationEffects}</span>`);
      }
      if (node.blockadeEffects) {
        html += sec("Efekty blokady", `<span style="color:#f87171">${node.blockadeEffects}</span>`);
      }
      if (node.naturalLigands && node.naturalLigands.length) {
        const tags = node.naturalLigands.map(l =>
          `<span class="tag" style="background:rgba(74,222,128,0.12);color:#4ade80;border-color:rgba(74,222,128,0.35)">${l}</span>`
        ).join(" ");
        html += sec("Ligandy naturalne", tags);
      }
      if (node.pharmaceuticalAgonists && node.pharmaceuticalAgonists.length) {
        const tags = node.pharmaceuticalAgonists.map(l =>
          `<span class="tag" style="background:rgba(96,165,250,0.12);color:#60a5fa;border-color:rgba(96,165,250,0.35)">${l}</span>`
        ).join(" ");
        html += sec("Agoniści farmaceutyczni", tags);
      }
      if (node.pharmaceuticalAntagonists && node.pharmaceuticalAntagonists.length) {
        const tags = node.pharmaceuticalAntagonists.map(l =>
          `<span class="tag" style="background:rgba(248,113,113,0.12);color:#f87171;border-color:rgba(248,113,113,0.35)">${l}</span>`
        ).join(" ");
        html += sec("Antagoniści farmaceutyczni", tags);
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
          return `<span style="color:${effectColor}">${dir}</span> ${otherLabel} <span style="color:#64748b;font-size:9px">${edge.description}</span>`;
        });
        html += sec(`Interakcje receptorowe (${relatedInteractions.length})`, interactionList.join("<br>"));
      }
    }

    // Connections
    const connections = allEdges.filter(edge => {
      if (!activeSystems.has(edge.system)) return false;
      if (!visibleIds.has(edge.from) || !visibleIds.has(edge.to)) return false;
      if (edge.connectionType === "brainRegion") return false;
      if (edge.connectionType === "degradation" && !validDegradationEdgeKeys.has(makeEdgeKey(edge))) return false;
      return edge.from === node.id || edge.to === node.id;
    });

    const footerLeft = document.getElementById("panel-footer-left");
    if (connections.length) {
      const connected = connections.map(edge => {
        const otherId = edge.from === node.id ? edge.to : edge.from;
        const otherNode = nodeMap.get(otherId);
        const connLabel = getConnectionStyle(edge.connectionType).label;
        return `${otherNode ? otherNode.label.replace(/\n/g, ' ') : otherId} <span style="color:#64748b">(${connLabel})</span>`;
      });
      html += sec(`Połączenia (${connected.length})`, [...new Set(connected)].join("<br>"));
      if (footerLeft) {
        if (node.type === "receptor" && brainRegionLinks.length) {
          footerLeft.textContent = `CONN · ${connected.length} · REG · ${brainRegionLinks.length}`;
        } else if (node.type === "brainRegion") {
          footerLeft.textContent = `REC · ${brainRegionLinks.length} · PATH · ${brainPathwayLinks.length}`;
        } else {
          footerLeft.textContent = `CONN · ${connected.length}`;
        }
      }
    } else {
      if (footerLeft) {
        if (node.type === "receptor" && brainRegionLinks.length) {
          footerLeft.textContent = `CONN · 0 · REG · ${brainRegionLinks.length}`;
        } else if (node.type === "brainRegion") {
          footerLeft.textContent = `REC · ${brainRegionLinks.length} · PATH · ${brainPathwayLinks.length}`;
        } else {
          footerLeft.textContent = "CONN · 0";
        }
      }
    }

    panelContent.innerHTML = html;
    infoPanel.classList.remove("hidden");
  }

  function syncPanelWithVisibility(visibleIds = new Set(visibleNodes.map(node => node.id))) {
    if (!panelNodeId) return;
    const node = nodeMap.get(panelNodeId);
    if (!node || !visibleIds.has(panelNodeId)) {
      panelNodeId = null;
      infoPanel.classList.add("hidden");
      return;
    }
    showPanel(node);
  }


  // ── Toolbar ────────────────────────────────────────────────────

  // Interaction toggle
  const interactionBtn = document.getElementById("toggleInteractions");
  const brainRegionToggle = document.getElementById("toggleBrainRegions");

  function syncBrainRegionToggleState() {
    if (!brainRegionToggle) return;
    brainRegionToggle.style.background = showBrainRegions ? "rgba(56, 189, 248, 0.22)" : "";
    brainRegionToggle.style.borderColor = showBrainRegions ? "rgba(56, 189, 248, 0.44)" : "";
    brainRegionToggle.style.color = showBrainRegions ? "#7dd3fc" : "";
    brainRegionToggle.setAttribute("aria-pressed", showBrainRegions ? "true" : "false");
  }

  interactionBtn.addEventListener("click", () => {
    showAllInteractions = !showAllInteractions;
    interactionBtn.style.background = showAllInteractions ? "rgba(251, 191, 36, 0.3)" : "";
    interactionBtn.style.borderColor = showAllInteractions ? "rgba(251, 191, 36, 0.5)" : "";
    requestRender();
  });

  if (brainRegionToggle) {
    brainRegionToggle.addEventListener("click", () => {
      showBrainRegions = !showBrainRegions;
      updateVisibility();
      syncBrainRegionToggleState();
      requestRender();
    });
    syncBrainRegionToggleState();
  }

  document.getElementById("zoomIn").addEventListener("click", () => zoomAt(W / 2, H / 2, 1.3));
  document.getElementById("zoomOut").addEventListener("click", () => zoomAt(W / 2, H / 2, 0.7));
  document.getElementById("resetView").addEventListener("click", () => fitToWorld());
  document.getElementById("resetPositions").addEventListener("click", () => {
    resetToDefaultPositions();
  });

  window.addEventListener("keydown", e => {
    if (e.key === "+" || e.key === "=") zoomAt(W / 2, H / 2, 1.2);
    if (e.key === "-") zoomAt(W / 2, H / 2, 0.8);
    if (e.key === "0") fitToWorld();
    if (e.key === "Escape") {
      panelNodeId = null;
      infoPanel.classList.add("hidden");
      clearSystemSelection();
      highlightedNodeId = null;
      requestRender();
    }
  });


  // ── System filters ─────────────────────────────────────────────

  const filterDropdown = document.getElementById("filter-dropdown");
  const filterToggle = document.getElementById("toggle-filters");

  function buildFilterUI() {
    const inner = filterDropdown.querySelector(".filter-dropdown-inner") || filterDropdown;
    inner.innerHTML = "";
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
      inner.appendChild(label);
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
    const headerH = 20; // .minimap-header height
    const drawH = mH - headerH;
    minimapCanvas.width = mW * pixelRatio;
    minimapCanvas.height = drawH * pixelRatio;
    minimapCanvas.style.width = `${mW}px`;
    minimapCanvas.style.height = `${drawH}px`;
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
    const scale = Math.min(mW / worldW, drawH / worldH);
    const offX = (mW - worldW * scale) / 2;
    const offY = (drawH - worldH * scale) / 2;

    minimapCtx.clearRect(0, 0, mW, drawH);

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
    const vpTop = (camera.y - H / 2 / camera.zoom - minY) * scale + offY + headerH;
    const vpW = (W / camera.zoom) * scale;
    const vpH = (H / camera.zoom) * scale;
    minimapViewport.style.left = `${Math.max(0, vpLeft)}px`;
    minimapViewport.style.top = `${Math.max(headerH, vpTop)}px`;
    minimapViewport.style.width = `${Math.min(vpW, mW)}px`;
    minimapViewport.style.height = `${Math.min(vpH, drawH)}px`;
  }

  // ── Start ──────────────────────────────────────────────────────

  requestRender();

})();
