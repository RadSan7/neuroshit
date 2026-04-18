import re

filepath = "/Users/a12345678/Pliki/Programowanie/neuroshit/medical-encyclopedia.js"
with open(filepath, "r", encoding="utf8") as f:
    text = f.read()

# Make all lineWidth thinner in CONNECTION_TYPES
text = re.sub(r'lineWidth: 2,', r'lineWidth: 1.2,', text)
text = re.sub(r'lineWidth: 1.5,', r'lineWidth: 1,', text)
text = re.sub(r'lineWidth: 1, dash: \[2, 4\]', r'lineWidth: 0.8, dash: [2, 4]', text) # precursor
text = re.sub(r'arrowSize: 8,', r'arrowSize: 6,', text)

with open(filepath, "w", encoding="utf8") as f:
    f.write(text)

print("Done")
