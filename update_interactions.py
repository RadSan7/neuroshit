import re

filepath = "/Users/a12345678/Pliki/Programowanie/neuroshit/medical-encyclopedia.js"
with open(filepath, "r", encoding="utf8") as f:
    text = f.read()

# Szukamy definicji RECEPTOR_INTERACTIONS
new_interactions = """  const RECEPTOR_INTERACTIONS = [
    // --- Istniejące receptor - receptor ---
    { from: "5HT_2A", to: "DA_D2", effect: "facilitation", description: "Blokada 5-HT2A ↑DA w PFC (mechanizm atypowych neuroleptyków)" },
    { from: "5HT_2B", to: "DA_D2", effect: "inhibition", description: "Blokada 5-HT2B → dezinhibicja DA (agomelatyna)" },
    { from: "5HT_2B", to: "NE_a1", effect: "facilitation", description: "Blokada 5-HT2B → dezinhibicja NE" },
    { from: "5HT_2C", to: "DA_D2", effect: "inhibition", description: "Aktywacja 5-HT2C hamuje DA; blokada → ↑DA w VTA" },
    { from: "5HT_2C", to: "NE_a1", effect: "inhibition", description: "5-HT2C hamuje NE; blokada ↑NE (mirtazapina)" },
    { from: "5HT_1A", to: "5HT_2A", effect: "inhibition", description: "Autoreceptor 5-HT1A ↓5-HT → pośrednio ↓5-HT2A" },
    { from: "5HT_1B", to: "DA_D2", effect: "facilitation", description: "5-HT1B w n. półleżącym ↑nagroda, ↑DA" },
    { from: "DA_D2", to: "NE_a2", effect: "modulation", description: "DA moduluje NE via heteroreceptory presynaptyczne" },
    { from: "NE_a2", to: "5HT_1A", effect: "facilitation", description: "Blokada α2-heteroreceptorów na neuronach 5-HT → ↑5-HT (mirtazapina)" },
    { from: "HA_H3", to: "DA_D2", effect: "inhibition", description: "H3 heteroreceptor hamuje uwalnianie DA w prążkowiu" },
    { from: "HA_H3", to: "5HT_1A", effect: "inhibition", description: "H3 heteroreceptor hamuje uwalnianie 5-HT (kora)" },
    { from: "HA_H3", to: "NE_a2", effect: "inhibition", description: "H3 heteroreceptor hamuje uwalnianie NE" },
    { from: "HA_H3", to: "ACh_M1", effect: "inhibition", description: "H3 hamuje uwalnianie ACh w korze → efekt prokognitywny blokady H3" },
    { from: "GABA_A", to: "DA_D2", effect: "inhibition", description: "Interneurony GABAergiczne hamują neurony DA w VTA" },
    { from: "GABA_B", to: "DA_D2", effect: "inhibition", description: "GABA-B na neuronach DA w VTA — baklofen ↓DA" },
    { from: "Glu_NMDA", to: "DA_D2", effect: "facilitation", description: "Glutaminian pobudza neurony DA. Hipoteza glutaminianowa schizofrenii" },
    { from: "Glu_mGluR2", to: "5HT_2A", effect: "inhibition", description: "mGluR2 i 5-HT2A tworzą heterodimer. mGluR2 hamuje szlak psychodeliczny" },
    { from: "eCB_CB1", to: "GABA_A", effect: "inhibition", description: "CB1 na interneuronach GABAerg. → DSI (↓GABA)" },
    { from: "eCB_CB1", to: "Glu_NMDA", effect: "inhibition", description: "CB1 na terminalach Glu → DSE (↓glutaminian)" },
    { from: "Opi_MOR", to: "GABA_A", effect: "inhibition", description: "μ-opioidowy hamuje interneurony GABA w VTA → dezinhibicja DA" },
    { from: "Opi_KOR", to: "DA_D2", effect: "inhibition", description: "κ-opioidowy hamuje DA w n. półleżącym → dysforia" },
    { from: "OX_OX1R", to: "DA_D2", effect: "facilitation", description: "Oreksyna-A pobudza neurony DA w VTA → nagroda, motywacja" },
    { from: "PUR_A2A", to: "DA_D2", effect: "inhibition", description: "A2A-D2 heterodimer. A2A allosterycznie hamuje D2 (kofeina uwalnia D2 z hamowania)" },
    { from: "ACh_M4", to: "DA_D2", effect: "inhibition", description: "M4 na neuronach prążkowia moduluje (hamuje) DA-ergiczną transmisję" },
    { from: "TA_TAAR1", to: "DA_D2", effect: "modulation", description: "TAAR1 moduluje DA — aktywacja ↓firing neuronów DA" },
    { from: "TA_TAAR1", to: "5HT_1A", effect: "modulation", description: "TAAR1 moduluje 5-HT — aktywacja ↓firing neuronów 5-HT" },
    
    // --- Dodane: Nowe interakcje receptor - receptor (sieci mieszane) ---
    { from: "NE_a1", to: "5HT_2A", effect: "facilitation", description: "Aktywacja α1 ułatwia wzbudzenie szlaków 5-HT2A w korze" },
    { from: "ACh_N_a7", to: "Glu_NMDA", effect: "facilitation", description: "Receptor α7 nAChR presynaptycznie ułatwia uwalnianie glutaminianu (prokognitywnie)" },
    { from: "5HT_3", to: "GABA_A", effect: "facilitation", description: "Szlaki 5-HT3 potęgują uwalnianie GABA na interneuronach (hamowanie kory)" },
    { from: "NE_b1", to: "ACh_M2", effect: "inhibition", description: "Receptory β1 i M2 działają przeciwstawnie na serce (Gs vs Gi) - crosstalk na poziomie komórki" },
    
    // --- Dodane: Interakcje receptor - neuroprzekaźnik (Wpływ Globalny na System) ---
    { from: "eCB_CB1", to: "Glu", effect: "inhibition", description: "Globalne hamowanie uwalniania Glutaminianu przez wsteczne sygnały eCB" },
    { from: "eCB_CB1", to: "GABA", effect: "inhibition", description: "Globalne hamowanie uwalniania GABA przez CB1 na interneuronach" },
    { from: "DA_D2", to: "DA", effect: "inhibition", description: "D2 jako autoreceptor fizycznie hamuje globalne wyrzuty dopaminy do szczeliny" },
    { from: "5HT_1A", to: "5HT", effect: "inhibition", description: "Autoreceptor somatodendrytyczny (jądra szwu) drastycznie tnie pule globalnego 5-HT" },
    { from: "NE_a2", to: "NE", effect: "inhibition", description: "Obwodowy i centralny dławik wyrzutu noradrenaliny układu współczulnego" },
    { from: "GABA_B", to: "Glu", effect: "inhibition", description: "GABA-B postsynaptyczny hyperpolaryzuje rzut Glutaminianu jako ogólny ton gaszący" },
    { from: "Opi_MOR", to: "GABA", effect: "inhibition", description: "Depresja całego układu interneuronów przez opioidy Egzogenne" },
    { from: "HA_H3", to: "HA", effect: "inhibition", description: "H3 to autohamowanie globalnego tonu pobudzenia histaminowego mózgu" },
    
    // --- Dodane: Interakcje receptor - enzym (Kaskady Wewnątrzkomórkowe) ---
    { from: "DA_D2", to: "DA_TH", effect: "inhibition", description: "Autoreceptor D2 defosforyluje TH, zatrzymując twardo syntezę na etapie tyrozyny" },
    { from: "5HT_1A", to: "5HT_TPH2", effect: "inhibition", description: "Gi wyciąga sygnał do TPH2 hamując enzymatyczną produkcję Serotoniny de novo" },
    { from: "NE_a2", to: "NE_DBH", effect: "inhibition", description: "α2 poprzez sprzężenie Gi spowalnia pęcherzykową aktywność hydroksylacyjną DBH" },
    { from: "ACh_M2", to: "ACh_ChAT", effect: "inhibition", description: "M2 autoreceptor hamuje sprzężenie zwrotne dla acetylotransferazy, redukując ACh" }
  ];"""

pattern = r'const RECEPTOR_INTERACTIONS = \[.*?\];'

text = re.sub(pattern, new_interactions, text, flags=re.DOTALL)

with open(filepath, "w", encoding="utf8") as f:
    f.write(text)

print("Podmiana RECEPTOR_INTERACTIONS zakonczona")
