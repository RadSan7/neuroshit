import re
import os

filepath = "/Users/a12345678/Pliki/Programowanie/neuroshit/medical-encyclopedia.js"
with open(filepath, "r", encoding="utf8") as f:
    text = f.read()

replacements = [
    (
        r'pharmaceuticalAgonists: \["Bromokryptyna", "Kabergolina", "Pramipeksol", "Ropinirol"\], pharmaceuticalAntagonists: \["Haloperidol", "Sulpiryd", "Risperidon", "Aripiprazol \(częściowy agonista\)"\]',
        r'pharmaceuticalAgonists: ["Bromokryptyna", "Pramipeksol", "Ropinirol", "Apomorfina", "Kabergolina"], pharmaceuticalAntagonists: ["Haloperidol", "Olanzapina", "Risperidon", "Kwetiapina", "Aripiprazol"]'
    ),
    (
        r'pharmaceuticalAgonists: \["LSD", "Psylocybina", "DOI", "Meskalina"\], pharmaceuticalAntagonists: \["Ketanseryna", "Klozapina", "Risperidon", "Pimawanseryna"\]',
        r'pharmaceuticalAgonists: ["LSD", "Psylocybina", "Meskalina", "DMT", "25I-NBOMe"], pharmaceuticalAntagonists: ["Klozapina", "Olanzapina", "Risperidon", "Kwetiapina", "Trazodon"]'
    ),
    (
        r'pharmaceuticalAgonists: \["Muscimol", "Gaboxadol"\], pharmaceuticalAntagonists: \["Bikukulina", "Gabazyna \(SR-95531\)"\]',
        r'pharmaceuticalAgonists: ["Diazepam (PAM)", "Alprazolam (PAM)", "Zolpidem (PAM)", "Propofol (PAM)", "Muscimol"], pharmaceuticalAntagonists: ["Flumazenil (NAM)", "Bikukulina", "Pikrotoksyna", "Gabazyna", "Flumazenil"]'
    ),
    (
        r'pharmaceuticalAgonists: \["NMDA"\], pharmaceuticalAntagonists: \["Ketamina", "Memantyna", "Fencyklidyna \(PCP\)", "MK-801 \(dizocylpina\)", "Mg²⁺ \(fizjologiczny\)"\]',
        r'pharmaceuticalAgonists: ["Kwas chinolinowy", "D-cykloseryna", "NMDA", "Glicyna", "Glutaminian"], pharmaceuticalAntagonists: ["Ketamina", "Memantyna", "Dekstrometorfan", "Fencyklidyna", "Amantadyna"]'
    ),
    (
        r'pharmaceuticalAgonists: \["Morfina", "Fentanyl", "Oksykodon", "Metadon", "Heroina"\], pharmaceuticalAntagonists: \["Nalokson", "Naltrekson", "Nalmefen"\]',
        r'pharmaceuticalAgonists: ["Morfina", "Fentanyl", "Oksykodon", "Buprenorfina", "Metadon"], pharmaceuticalAntagonists: ["Nalokson", "Naltrekson", "Nalmefen", "Buprenorfina (NAM/p.Ag)", "Nalorfina"]'
    )
]

for old, new in replacements:
    text = re.sub(old, new, text)

with open(filepath, "w", encoding="utf8") as f:
    f.write(text)

print("Done")
