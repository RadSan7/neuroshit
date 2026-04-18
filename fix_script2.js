const fs = require("fs");
const filepath = "/Users/a12345678/Pliki/Programowanie/neuroshit/script.js";
let text = fs.readFileSync(filepath, "utf8");

text = text.replace(
  /const style = getConnectionStyle\(edge\.connectionType\);/g,
  `const style = { ...getConnectionStyle(edge.connectionType) };
    if (edge.importance === "secondary") {
      style.color = style.color.replace(/rgba\\((.*?),\s*[.\\d]+\\)/, "rgba($1, 0.15)");
      style.lineWidth = style.lineWidth * 0.5;
    }`
);

fs.writeFileSync(filepath, text);
console.log("Done");
