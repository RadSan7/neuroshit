import re

filepath = "/Users/a12345678/Pliki/Programowanie/neuroshit/script.js"
with open(filepath, "r", encoding="utf8") as f:
    text = f.read()

# Pass 'importance' attribute to allEdges
text = text.replace(
'''      allEdges.push({
        from: conn.from,
        to: conn.to,
        connectionType: conn.connectionType,
        system: system.id,
      });''',
'''      allEdges.push({
        from: conn.from,
        to: conn.to,
        connectionType: conn.connectionType,
        system: system.id,
        importance: conn.importance || "main",
      });'''
)

# And in buildSynthesisChains
text = text.replace(
'''            synthesisChains.push({
              substrate, enzyme, product,
              chainType,
              system: inEdge.system,
            });''',
'''            synthesisChains.push({
              substrate, enzyme, product,
              chainType,
              system: inEdge.system,
              importance: outEdge.importance || "main",
            });'''
)

# Render them dim if secondary
text = re.sub(
r'(function drawEdge\(edge\) \{\n.*const style = \{ \.\.\.CONNECTION_TYPES\[edge\.connectionType\] \};.*?)\n',
r'\1\n    if (edge.importance === "secondary") {\n      style.color = style.color.replace(/[\d\.]+\)$/, "0.15)");\n      ctx.globalAlpha = 0.4;\n    }\n',
text, count=1, flags=re.DOTALL|re.MULTILINE
)

# And we must restore globalAlpha at end of drawEdge
text = re.sub(
r'(    ctx.fill\(\);\n  \})',
r'    ctx.fill();\n    ctx.globalAlpha = 1.0;\n  }',
text
)

# Also in drawSynthesisChain
text = re.sub(
r'(function drawSynthesisChain\(chain\) \{\n.*?const style = \{ \.\.\.(?:.*?CONNECTION_TYPES\.(?:synthesis|degradation)) \};.*?)\n',
r'\1\n    if (chain.importance === "secondary") {\n      style.color = style.color.replace(/[\d\.]+\)$/, "0.15)");\n      ctx.globalAlpha = 0.4;\n    }\n',
text, count=1, flags=re.DOTALL|re.MULTILINE
)

# Wait, the spreading of CONNECTION_TYPES might not be happening in drawSynthesisChain, let's check it.
with open(filepath, "w", encoding="utf8") as f:
    f.write(text)
print("Done first step")
