const fs = require("fs");
const filepath = "/Users/a12345678/Pliki/Programowanie/neuroshit/script.js";
let text = fs.readFileSync(filepath, "utf8");

text = text.replace(
`      allEdges.push({
        from: conn.from,
        to: conn.to,
        connectionType: conn.connectionType,
        system: system.id,
      });`,
`      allEdges.push({
        from: conn.from,
        to: conn.to,
        connectionType: conn.connectionType,
        system: system.id,
        importance: conn.importance || "main",
      });`
);

text = text.replace(
`            synthesisChains.push({
              substrate, enzyme, product,
              chainType,
              system: inEdge.system,
            });`,
`            synthesisChains.push({
              substrate, enzyme, product,
              chainType,
              system: inEdge.system,
              importance: outEdge.importance || "main",
            });`
);

// Update drawEdge
text = text.replace(
  /const style = \{\s*\.\.\.CONNECTION_TYPES\[edge\.connectionType\]\s*\};/,
  `const style = { ...CONNECTION_TYPES[edge.connectionType] };
    if (edge.importance === "secondary") {
      style.color = style.color.replace(/rgba\\((.*?),\\s*[.\\d]+\\)/, "rgba($1, 0.15)");
    }`
);

// Update drawSynthesisChain
text = text.replace(
  /const style = chainType === "synthesis"[\s\S]*?\? CONNECTION_TYPES\.synthesis[\s\S]*?: CONNECTION_TYPES\.degradation;/,
  `const baseStyle = chainType === "synthesis"
      ? CONNECTION_TYPES.synthesis
      : CONNECTION_TYPES.degradation;
    const style = { ...baseStyle };
    if (chain.importance === "secondary") {
      style.color = style.color.replace(/rgba\\((.*?),\\s*[.\\d]+\\)/, "rgba($1, 0.15)");
    }`
);

fs.writeFileSync(filepath, text);
console.log("Done");
