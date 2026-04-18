const fs = require("fs");
const filepath = "/Users/a12345678/Pliki/Programowanie/neuroshit/script.js";
let text = fs.readFileSync(filepath, "utf8");

text = text.replace(/rgba\\\(\(\.\*\?\),s\*\[\.\\\\d\]\+\\\)/g, /rgba\((.*?),\s*[.\d]+\)/.source);
fs.writeFileSync(filepath, text);
