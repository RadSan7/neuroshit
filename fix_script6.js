const fs = require("fs");
const filepath = "/Users/a12345678/Pliki/Programowanie/neuroshit/script.js";
let text = fs.readFileSync(filepath, "utf8");

text = text.replace(/style\.color\.replace\(.*?\);/g, 'style.color.replace(/rgba\\\\((.*?),\s*[\\d.]+\\\\)/, "rgba($1, 0.15)");');
fs.writeFileSync(filepath, text);
