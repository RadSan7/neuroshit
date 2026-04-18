import re

filepath = "/Users/a12345678/Pliki/Programowanie/neuroshit/medical-encyclopedia.js"
with open(filepath, "r", encoding="utf8") as f:
    text = f.read()

replacements = [
    ('{ from: "DA_Phe", to: "AADC", connectionType: "precursorConversion", label: "PEA" }',
     '{ from: "DA_Phe", to: "AADC", connectionType: "precursorConversion", label: "PEA", importance: "secondary" }'),
    ('{ from: "AADC", to: "TA_PEA", connectionType: "synthesis" }',
     '{ from: "AADC", to: "TA_PEA", connectionType: "synthesis", importance: "secondary" }'),
    ('{ from: "DA_Tyr", to: "AADC", connectionType: "precursorConversion", label: "Tyramina" }',
     '{ from: "DA_Tyr", to: "AADC", connectionType: "precursorConversion", label: "Tyramina", importance: "secondary" }'),
    ('{ from: "AADC", to: "TA_Tyramine", connectionType: "synthesis" }',
     '{ from: "AADC", to: "TA_Tyramine", connectionType: "synthesis", importance: "secondary" }'),
    ('{ from: "5HT_Trp", to: "AADC", connectionType: "precursorConversion", label: "Tryptamina" }',
     '{ from: "5HT_Trp", to: "AADC", connectionType: "precursorConversion", label: "Tryptamina", importance: "secondary" }'),
    ('{ from: "AADC", to: "TA_Tryptamine", connectionType: "synthesis" }',
     '{ from: "AADC", to: "TA_Tryptamine", connectionType: "synthesis", importance: "secondary" }'),
    ('{ from: "TA_Tyramine", to: "NE_DBH", connectionType: "precursorConversion" }',
     '{ from: "TA_Tyramine", to: "NE_DBH", connectionType: "precursorConversion", importance: "secondary" }'),
    ('{ from: "NE_DBH", to: "TA_Octopamine", connectionType: "synthesis" }',
     '{ from: "NE_DBH", to: "TA_Octopamine", connectionType: "synthesis", importance: "secondary" }'),
    ('{ from: "TA_Octopamine", to: "NE_PNMT", connectionType: "precursorConversion" }',
     '{ from: "TA_Octopamine", to: "NE_PNMT", connectionType: "precursorConversion", importance: "secondary" }'),
    ('{ from: "NE_PNMT", to: "TA_Synephrine", connectionType: "synthesis" }',
     '{ from: "NE_PNMT", to: "TA_Synephrine", connectionType: "synthesis", importance: "secondary" }'),
]

for old, new in replacements:
    text = text.replace(old, new)

with open(filepath, "w", encoding="utf8") as f:
    f.write(text)

print("Done")
