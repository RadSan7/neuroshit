# Baza receptorow mozgu z atlasu projektu

Data opracowania: 2026-04-18

Zakres:

- 71 wezlow receptorowych z listy projektowej w `medical-encyclopedia.js`
- uklad: typ receptora -> wystepowanie w mozgu -> funkcja receptora w konkretnym miejscu

Glowna baza regionalna:

- Human Protein Atlas, Brain resource: <https://www.proteinatlas.org/humanproteome/brain>

Glowne przeglady funkcjonalne wykorzystane do syntezy:

- Dopamine receptors - IUPHAR Review 13: <https://pmc.ncbi.nlm.nih.gov/articles/PMC4280963/>
- The Expanded Biology of Serotonin: <https://pmc.ncbi.nlm.nih.gov/articles/PMC5864293/>
- Muscarinic receptors: their distribution and function in body systems: <https://pmc.ncbi.nlm.nih.gov/articles/PMC1751864/>
- Glutamate Receptor Ion Channels: Structure, Regulation, and Function: <https://pmc.ncbi.nlm.nih.gov/articles/PMC2964903/>
- GABAA receptors: structure, function, pharmacology, and related disorders: <https://pmc.ncbi.nlm.nih.gov/articles/PMC8380214/>
- Histamine and histamine receptors: Roles in major depressive disorder: <https://pmc.ncbi.nlm.nih.gov/articles/PMC8317266/>
- Current Research on Opioid Receptor Function: <https://pmc.ncbi.nlm.nih.gov/articles/PMC3371376/>
- Multiple functions of endocannabinoid signaling in the brain: <https://pmc.ncbi.nlm.nih.gov/articles/PMC5209363/>
- Trace amine-associated receptors as emerging therapeutic targets: <https://pmc.ncbi.nlm.nih.gov/articles/PMC2713119/>
- alpha1-Adrenergic Receptors in Neurotransmission, Synaptic Plasticity, and Cognition: <https://pmc.ncbi.nlm.nih.gov/articles/PMC7553051/>
- Orexin receptor signalling in physiology and disease: <https://pmc.ncbi.nlm.nih.gov/articles/PMC6031739/>
- Neuropharmacology of the neurokinin receptors: <https://pmc.ncbi.nlm.nih.gov/articles/PMC2967650/>
- Purinergic Signaling and Microglial Wrapping: <https://pmc.ncbi.nlm.nih.gov/articles/PMC7297484/>
- Neuropeptide Y in neurobiology of stress: <https://pmc.ncbi.nlm.nih.gov/articles/PMC4830398/>
- Oxytocin, vasopressin, and sociality reviews used for conserved circuits: <https://pmc.ncbi.nlm.nih.gov/articles/PMC4585313/> and <https://pmc.ncbi.nlm.nih.gov/articles/PMC9974677/>

Jak czytac status OUN:

- `silny OUN` - dobrze potwierdzona, szeroka lub funkcjonalnie istotna ekspresja w mozgu
- `umiarkowany OUN` - wyrazna, ale bardziej obwodowo lub obwodowo-cyrkulacyjnie ograniczona ekspresja
- `ograniczony OUN` - receptor obecny tylko w wybranych niszach, typach komorek albo stanach chorobowych
- `gl. obwodowy` - w projekcie jest wezlem receptorowym, ale dane dla mozgu sa slabe lub drugorzedne

Wazna uwaga metodologiczna:

- wezly rodzinne (`ACh_nAChR`, `Glu_mGluR1`, `Glu_mGluR2`, `Glu_mGluR4`, `PUR_P2X`, `PUR_P2Y`) opisano na poziomie dominujacych podtypow istotnych dla OUN, a nie jako rozpisanie kazdego genu osobno
- w receptorach o duzej zmiennosci gatunkowej (`OXTR`, `AVP_V1a`, czesc `TAAR`) podano obwody najbardziej zachowane miedzy ssakami zamiast zbyt precyzyjnych, watpliwych map gatunkowych

## Dopaminowy

| ID | Typ | Wystepowanie w mozgu | Funkcja lokalna | Status OUN |
| --- | --- | --- | --- | --- |
| DA_D1 | D1 | Prazenie grzbietowe, nucleus accumbens, kora przedczolowa, guzek wechowy | Prazenie: aktywacja szlaku direct, ruch i uczenie nagrody; PFC: pamiec robocza i selekcja sygnalu | silny OUN |
| DA_D2 | D2 | Prazenie, nucleus accumbens, VTA/SNc (autoreceptory), przysadka/tuberoinfundibularny uklad dopaminowy | Prazenie: szlak indirect i hamowanie ruchu; neurony DA: hamowanie wyadowan i uwalniania dopaminy | silny OUN |
| DA_D3 | D3 | Nucleus accumbens shell, brzuszne prazenie, wyspy Calleja, guzek wechowy | Motywacja, salience, antynagroda i podatnosc na uzaleznienia w obwodach limbicznych | silny OUN |
| DA_D4 | D4 | Kora przedczolowa, hipokamp, cialo migdalowate, zakret obreczy | Kontrola pobudliwosci korowej, uwagi, impulsywnosci i integracji emocjonalnej | umiarkowany OUN |
| DA_D5 | D5 | Hipokamp, podwzgorze, wzgorze, kora limbiczna | Moduluje pobudliwosc, PLC/Ca2+, funkcje pamieciowe i neuroendokrynne | umiarkowany OUN |

## Noradrenergiczny

| ID | Typ | Wystepowanie w mozgu | Funkcja lokalna | Status OUN |
| --- | --- | --- | --- | --- |
| NE_a1 | alfa1 (przewaznie alfa1A/alfa1B) | PFC, hipokamp CA1/CA3/DG, cialo migdalowate, wzgorze, podwzgorze, opuszka wechowa, mozdzek | Czuwanie i sensory gating; PFC/hipokamp: plastycznosc i uwaga; amygdala: modulacja strachu i stresu | silny OUN |
| NE_a2 | alfa2 (gl. alfa2A/alfa2C) | Locus coeruleus (autoreceptory), PFC, hipokamp, wzgorze, NTS, rog grzbietowy, amygdala | Hamuje uwalnianie noradrenaliny; PFC: stabilizuje sieci pamieci roboczej; NTS/rog grzbietowy: analgezja i ton autonomiczny | silny OUN |
| NE_b1 | beta1 | Kora, hipokamp, cialo migdalowate, mozdzek, pieklo mozgowe/pien mozgu | Zwieksza pobudliwosc i konsolidacje pamieci emocjonalnej; wspiera czuwanie i odpowiedz stresowa | umiarkowany OUN |
| NE_b2 | beta2 | Hipokamp, kora, mozdzek, astrocyty, mikrokrążenie i komorki glejowe | Neurovascular coupling, mobilizacja energetyczna astrocytow, plastycznosc i odzyskiwanie po stresie | umiarkowany OUN |
| NE_b3 | beta3 | Podwzgorze, pieklo/pien mozgu, wybrane obwody autonomiczne; ekspresja niska | Regulacja bilansu energetycznego i autonomii; rola poznawcza wtórna i slabo potwierdzona | ograniczony OUN |

## Serotoninowy i melatoninowy

| ID | Typ | Wystepowanie w mozgu | Funkcja lokalna | Status OUN |
| --- | --- | --- | --- | --- |
| 5HT_1A | 5-HT1A | Jadra szwu (autoreceptory), hipokamp, przegroda, medial PFC, cialo migdalowate | Jadra szwu: hamuje firing neuronow 5-HT; hipokamp/PFC: anxioliza, stres, integracja emocji | silny OUN |
| 5HT_1B | 5-HT1B | Zakonczenia presynaptyczne w prazeniu, gałce bladej, SN, korze i ukl. trigeminowaskularnym | Hamuje uwalnianie 5-HT, glutaminianu i dopaminy; w migrenie tlumi sygnal trigeminowaskularny | silny OUN |
| 5HT_2A | 5-HT2A | Kora asocjacyjna i warstwa V, PFC, claustrum, wzgorze, amygdala | Pobudzenie neuronow piramidowych, percepcja, integracja sensoryczna i plastycznosc korowa | silny OUN |
| 5HT_2B | 5-HT2B | Splot naczyniowy, elementy naczyniowe i oponowe, sladowo niektore komorki glejowe | W OUN rola glownie naczyniowo-CSF; funkcjonalnie wazniejszy poza mozgiem | gl. obwodowy |
| 5HT_2C | 5-HT2C | Splot naczyniowy, podwzgorze, nucleus accumbens, amygdala, VTA/SN | Podwzgorze: sygnal sytnosci i homeostaza energii; uklad mezolimbiczny: hamowanie nadmiernej dopaminy | silny OUN |
| 5HT_3 | 5-HT3 | Area postrema, NTS, jadra pnia, interneurony hipokampa i amygdali | Szybka transmisja kationowa; pień mozgu: odruch wymiotny; limbicznie: lek, bol i fast excitation | silny OUN |
| 5HT_4 | 5-HT4 | Hipokamp, prazenie, kora, pre-Botzinger/obwody oddechowe pnia | Ulatwia uwalnianie ACh i plastycznosc; pień: moze przeciwdzialac depresji oddechowej po opioidach | umiarkowany OUN |
| 5HT_1D | 5-HT1D | Uklad trigeminowaskularny, pień mozgu, jadra czuciowe n. V, prazenie | Hamuje uwalnianie neuropeptydow i bodzcow migrenowych; moduluje transmisje bolowa | umiarkowany OUN |
| 5HT_1F | 5-HT1F | Drogi trigeminalne, rog grzbietowy, pień mozgu, slabo kora | Antynocycepcja i dzialanie przeciwmigrenowe bez silnego efektu naczyniowego | umiarkowany OUN |
| 5HT_5A | 5-HT5A | Hipokamp, kora, podwzgorze, jadro nadskrzyzowaniowe | Hamujaca modulacja rytmiki okołodobowej, temperatury i funkcji poznawczych; dane nadal skromne | ograniczony OUN |
| 5HT_6 | 5-HT6 | Prazenie, nucleus accumbens, kora, hipokamp | Regulacja poznania przez modulacje ACh i glutaminianu; takze apetyt i habit learning | silny OUN |
| 5HT_7 | 5-HT7 | Wzgorze, hipokamp, podwzgorze/SCN, kora, jadra szwu | Rytm dobowy, termoregulacja, nastroj i plastycznosc hipokampalna | silny OUN |
| 5HT_MT1 | MT1 | SCN, podwzgorze, wzgorze, hipokamp | Inicjacja snu i nocnego hamowania zegara biologicznego | umiarkowany OUN |
| 5HT_MT2 | MT2 | SCN, wzgorze, hipokamp, siatkowka-sciezki okołodobowe | Przesuniecie fazy zegara, synchronizacja rytmu dobowego i sygnalu swiatla | umiarkowany OUN |

## Cholinergiczny

| ID | Typ | Wystepowanie w mozgu | Funkcja lokalna | Status OUN |
| --- | --- | --- | --- | --- |
| ACh_nAChR | nAChR, wezel rodzinny (gl. alpha4beta2, alpha7, alpha3beta4) | Wzgorze, kora, hipokamp, VTA, prazenie, jadro przyspoidlowe przysrodkowe i interpeduncular nucleus | Uwaga, sensory gating i pamiec; VTA: uwalnianie dopaminy; habenula-IPN: awersja nikotynowa i objawy odstawienne | silny OUN |
| ACh_M1 | M1 | Kora nowa, hipokamp, prazenie | Zwieksza pobudliwosc i plastycznosc; pamiec, uczenie i integracja korowo-hipokampalna | silny OUN |
| ACh_M2 | M2 | Caly mozg, szczegolnie hipokamp, kora, wzgorze, neurony cholinergiczne | Autoreceptor hamujacy uwalnianie ACh; moduluje sen, rytm i cholinergiczny feedback | umiarkowany OUN |
| ACh_M3 | M3 | Niskie poziomy w hipokampie, wzgorzu, niektorych neuronach GABA w prazeniu i podwzgorzu | Rola OUN wtórna; lokalnie modulacja autonomiczna i neuroendokrynna | ograniczony OUN |
| ACh_M4 | M4 | Prazenie, kora, hipokamp | Prazenie: hamuje D1-MSN i sygnal nagrody; rola przeciwpsychotyczna i antydyskinetyczna | silny OUN |
| ACh_M5 | M5 | Neurony dopaminowe VTA/SNc, hipokamp, naczynia mozgowe | Ulatwia sygnal nagrody przez DA i cholinergiczne rozszerzenie naczyń mozgu | umiarkowany OUN |

## Glutaminianowy

| ID | Typ | Wystepowanie w mozgu | Funkcja lokalna | Status OUN |
| --- | --- | --- | --- | --- |
| Glu_NMDA | NMDA | Kora, hipokamp, wzgorze, prazenie, mozdzek | Coincidence detection, LTP/LTD, uczenie, integracja synaptyczna i bol centralny | silny OUN |
| Glu_AMPA | AMPA | Praktycznie wszystkie szybkie synapsy pobudzajace; kora, hipokamp, mozdzek | Glowny szybki EPSC i kodowanie informacji czesciowo przez trafficking receptorow | silny OUN |
| Glu_KA | Kainate | Hipokamp CA3 i zakret zabkowany, kora, amygdala, prazenie | Pre- i postsynaptyczna modulacja pobudzenia; rola w epileptogenezie i nocicepcji | silny OUN |
| Glu_mGluR1 | mGluR1/5, grupa I | mGluR1: mozdzek/Purkinje; mGluR5: hipokamp, PFC, prazenie, amygdala | Wolniejsza modulacja pobudliwosci, LTD i sprzezenie z PLC/Ca2+; uczenie, nagroda, bol | silny OUN |
| Glu_mGluR2 | mGluR2/3, grupa II | Presynaptycznie w korze, hipokampie, wzgorzu; mGluR3 takze w astrocytach | Hamuje uwalnianie glutaminianu, stabilizuje sieci i zmniejsza nadmierne pobudzenie/stres | silny OUN |
| Glu_mGluR4 | mGluR4/6/7/8, grupa III | Mozdzek, jadra podstawy, wzgorze, presynaptyczne terminale hipokampa; mGluR6 gl. siatkowka | Tlumienie uwalniania neuroprzekaznikow; mozdzek i BG: kontrola motoryki; neuroprotekcja | umiarkowany OUN |

## GABAergiczny

| ID | Typ | Wystepowanie w mozgu | Funkcja lokalna | Status OUN |
| --- | --- | --- | --- | --- |
| GABA_A | GABAA | Kora, hipokamp, wzgorze, mozdzek, pień; podtypowo np. alpha6 w mozdzku, alpha5 w hipokampie | Szybka inhibicja fazowa i toniczna; sedacja, anksjoliza, przeciwdrgawkowo i kontrola rytmow | silny OUN |
| GABA_B | GABAB | Kora, hipokamp, wzgorze, rdzen, presynaptycznie i postsynaptycznie | Powolna inhibicja metabotropowa, hamowanie release glutaminianu/GABA, spastycznosc i bol | silny OUN |

## Histaminowy

| ID | Typ | Wystepowanie w mozgu | Funkcja lokalna | Status OUN |
| --- | --- | --- | --- | --- |
| HA_H1 | H1 | Kora, wzgorze, podwzgorze, jadra przedsionkowe, hipokamp | Czuwanie, apetyt, przedsionkowo-wymiotna integracja; blokada daje sedacje | silny OUN |
| HA_H2 | H2 | Kora, hipokamp, amygdala, prazenie | Zwieksza pobudliwosc neuronow i wspiera konsolidacje pamieci; rola tez poza OUN | umiarkowany OUN |
| HA_H3 | H3 | Kora, hipokamp, prazenie, jadra histaminergiczne podwzgorza, zakonczenia presynaptyczne | Presynaptyczny hamulec dla histaminy, ACh, DA i NE; czuwanie i funkcje poznawcze | silny OUN |
| HA_H4 | H4 | Mikroglej i komorki immunologiczne OUN, glownie w stanach zapalnych | Neuroimmunologia, swiad i zapalenie; neuronalna rola w zdrowym mozgu slaba | ograniczony OUN |

## Opioidowy

| ID | Typ | Wystepowanie w mozgu | Funkcja lokalna | Status OUN |
| --- | --- | --- | --- | --- |
| Opi_MOR | mu opioidowy | PAG, wzgorze, VTA, nucleus accumbens, locus coeruleus, NTS, rog grzbietowy, amygdala | Analgezja, euforia/nagroda, oddychanie, stres i objawy odstawienne | silny OUN |
| Opi_DOR | delta opioidowy | Kora, hipokamp, prazenie, opuszka wechowa, amygdala | Analgezja, modulacja nastroju, odpornosc na stres i czesciowo neuroprotekcja | silny OUN |
| Opi_KOR | kappa opioidowy | Podwzgorze, amygdala, nucleus accumbens, PAG, VTA, rog grzbietowy | Dysforia, antynagroda, odpowiedz na stres i analgezja o komponencie awersyjnej | silny OUN |

## Endokannabinoidowy

| ID | Typ | Wystepowanie w mozgu | Funkcja lokalna | Status OUN |
| --- | --- | --- | --- | --- |
| eCB_CB1 | CB1 | Kora, hipokamp, jadra podstawy, mozdzek, amygdala, presynaptyczne terminale w calym mozgu | Retrograde inhibition release, apetyt, pamiec, nagroda i analgezja | silny OUN |
| eCB_CB2 | CB2 | Mikroglej, komorki immunologiczne, niektore neurony hipokampa/VTA przy aktywacji zapalnej | Neuroimmunologia, naprawa i kontrola zapalenia; w zdrowym mozgu zwykle nizszy sygnal | ograniczony OUN |
| eCB_TRPV1 | TRPV1 | Rog grzbietowy, PAG, podwzgorze, hipokamp, amygdala, aferenty czuciowe | Bol i termika; w mozgu takze modulacja lęku, plastycznosci i sygnalizacji anandamidu | umiarkowany OUN |
| eCB_GPR55 | GPR55 | Hipokamp, prazenie, mozdzek, podwzgorze; ekspresja nierownomierna | Moduluje pobudliwosc, bol i neurozapalnie; mapa OUN nadal niejednolita | ograniczony OUN |

## TAAR

| ID | Typ | Wystepowanie w mozgu | Funkcja lokalna | Status OUN |
| --- | --- | --- | --- | --- |
| TA_TAAR1 | TAAR1 | PFC, jadra podstawy, VTA, obszary ze szlakami monoaminowymi, jadra szwu | Moduluje firing neuronow monoaminowych, D2/DAT/SERT i wrazliwosc na psychostymulanty | umiarkowany OUN |
| TA_TAAR2 | TAAR2 | Dane dla mozgu skape; glownie uklad wechowy i mozliwe nisze limbiczne | Prawdopodobnie sygnaly amin lotnych/chemosensoryka; szeroka funkcja OUN niepotwierdzona | ograniczony OUN |
| TA_TAAR5 | TAAR5 | Opuszka wechowa, obwody limbiczne zwiazane z wechem, amygdala/podwzgorze w niektorych modelach | Powiazanie zapachu amin z salience emocjonalna i zachowaniem spolecznym | ograniczony OUN |

## Oreksynowy

| ID | Typ | Wystepowanie w mozgu | Funkcja lokalna | Status OUN |
| --- | --- | --- | --- | --- |
| OX_OX1R | OX1R | Locus coeruleus, VTA, amygdala, wzgorze srodkowe, insula, BNST | Czuwanie, stres, nagroda i poszukiwanie bodzcow; istotny w nawrocie uzaleznien | silny OUN |
| OX_OX2R | OX2R | Jadro guzowo-suteczkowe, jadra szwu, PPT/LDT, podwzgorze, pień | Stabilizacja stanu wake, kontrola snu REM/NREM i narcolepsji | silny OUN |

## Oksytocyna i wazopresyna

| ID | Typ | Wystepowanie w mozgu | Funkcja lokalna | Status OUN |
| --- | --- | --- | --- | --- |
| OXY_OXTR | OXTR | Podwzgorze, amygdala, BNST, lateral septum, nucleus accumbens, hipokamp | Zachowania spoleczne, przywiazanie, opieka rodzicielska i tłumienie reakcji lękowej | umiarkowany OUN |
| AVP_V1a | V1a | Lateral septum, BNST, amygdala, ventral pallidum, podwzgorze | Rozpoznawanie spoleczne, agresja terytorialna, pamiec socjalna i stres | umiarkowany OUN |
| AVP_V1b | V1b | Przysadka przednia, podwzgorze, hipokamp i amygdala na nizszych poziomach | Oś HPA i ACTH, odpowiedz stresowa i integracja bodzcow emocjonalnych | umiarkowany OUN |
| AVP_V2 | V2 | Dane OUN bardzo slabe; sporadycznie splot naczyniowy/ependymalny | Funkcyjnie najwazniejszy nerkowo; brak mocnego dowodu na centralna role neuronalna | gl. obwodowy |

## Tachykininowy

| ID | Typ | Wystepowanie w mozgu | Funkcja lokalna | Status OUN |
| --- | --- | --- | --- | --- |
| TK_NK1 | NK1 | Amygdala, podwzgorze, PAG, NTS, jadra pnia, rog grzbietowy, jadra podstawy | Bol, wymioty, stres i lek; wazny receptor substancji P | silny OUN |
| TK_NK2 | NK2 | Podwzgorze, pień mozgu, niektore obwody trzewne; ogolnie nizsza ekspresja centralna | Modulacja trzewno-autonomiczna i sygnalow interoceptywnych; poza OUN wazniejszy | ograniczony OUN |
| TK_NK3 | NK3 | Podwzgorze (neurony KNDy), istota czarna, VTA, gałka blada, przodomozgowie podstawne | Termoregulacja i GnRH; modulacja dopaminowa, ruchu i stanu pobudzenia | umiarkowany OUN |

## NPY

| ID | Typ | Wystepowanie w mozgu | Funkcja lokalna | Status OUN |
| --- | --- | --- | --- | --- |
| NPY_Y1 | Y1 | Amygdala, hipokamp, kora, podwzgorze, prazenie | Anksjoliza, tlumienie drgawek i sygnal glodu w obwodach limbicznych i podwzgorzu | silny OUN |
| NPY_Y2 | Y2 | Hipokamp, kora, amygdala, podwzgorze, presynaptyczne terminale | Hamuje release NPY i glutaminianu; ogranicza pobudzenie i czesciowo hamuje apetyt | silny OUN |
| NPY_Y4 | Y4 | Area postrema, NTS, grzbietowy kompleks wagowy, podwzgorze | Sygnał sytnosci i integracja trzewno-autonomiczna, glownie przez PP/PYY | ograniczony OUN |
| NPY_Y5 | Y5 | Jadro lukowate i PVN podwzgorza, nizsze poziomy w hipokampie | Pobieranie pokarmu i homeostaza energetyczna, szczegolnie w obwodach oreksygennych | umiarkowany OUN |

## Purynowy i adenozynowy

| ID | Typ | Wystepowanie w mozgu | Funkcja lokalna | Status OUN |
| --- | --- | --- | --- | --- |
| PUR_P2X | P2X, wezel rodzinny | Neurony i glej w hipokampie, pniu, korze; P2X7 w mikrogleju, P2X3 gl. czuciowo | Szybka sygnalizacja ATP, bol, neurozapalnie i komunikacja neuron-glej | umiarkowany OUN |
| PUR_P2Y | P2Y, wezel rodzinny | Astrocyty, mikroglej, oligodendrocyty, hipokamp, kora, mozdzek | Wolniejsza sygnalizacja ATP/ADP, migracja gleju, fagocytoza i modulacja synaps | umiarkowany OUN |
| PUR_A1 | A1 | Kora, hipokamp, mozdzek, wzgorze, hipotalamus | Hamuje pobudzenie, dziala neuroprotekcyjnie, przeciwdrgawkowo i usypiajaco | silny OUN |
| PUR_A2A | A2A | Prazenie/putamen/caudate, opuszka wechowa, nizsze poziomy w hipokampie i korze | W BG przeciwdziala D2, reguluje ruch i motywacje; takze zapalenie i naczynia | silny OUN |
| PUR_A2B | A2B | Niska ekspresja, glownie glej i naczynia, hipokamp/kora przy stresie lub zapaleniu | Odpowiedz naczyniowo-zapalna i naprawa; rola synaptyczna wtórna | ograniczony OUN |
| PUR_A3 | A3 | Niski sygnal w mikrogleju i astrocytach, wyrazniejszy w stanach patologicznych | Neuroimmunologia i potencjalna neuroprotekcja; funkcjonalnie slabiej zmapowany | ograniczony OUN |

## Szybkie podsumowanie wzorcow

- Najsilniej centralne i najbardziej kanoniczne dla atlasu: dopaminowe, serotonergiczne, cholinergiczne M1/M4/nAChR, glutaminianowe, GABA, H1/H3, opioidowe, CB1, oreksynowe, A1/A2A.
- Centralne, ale bardziej obwodowo-lub-komorkowo specyficzne: D4/D5, beta1/beta2, 5-HT4/5A/1D/1F, M2/M5, NK3, Y5, P2X/P2Y.
- Wezly z ograniczona lub glownie obwodowa rola w mozgu: 5-HT2B, M3, H4, CB2, GPR55, TAAR2, AVP_V2, NK2, Y4, A2B, A3, beta3.

## Co warto rozbic w kolejnej iteracji

- `ACh_nAChR` na co najmniej `alpha4beta2`, `alpha7`, `alpha3beta4`
- `Glu_mGluR1` na `mGluR1` i `mGluR5`
- `Glu_mGluR2` na `mGluR2` i `mGluR3`
- `Glu_mGluR4` na `mGluR4`, `mGluR7`, `mGluR8` z adnotacja, ze `mGluR6` jest praktycznie siatkowkowy
- `PUR_P2X` na co najmniej `P2X2/4`, `P2X7`, `P2X3`
- `PUR_P2Y` na `P2Y1`, `P2Y2/4/6`, `P2Y12`

Ta baza jest przygotowana jako plik wiedzy do dalszego wykorzystania w projekcie, bez implementacji w kodzie. Dla receptorow z bardzo zmienna mapa gatunkowa lub slabo zreplikowana ekspresja wpisy sa celowo konserwatywne.

## Aneks funkcjonalny: znak polaczen receptor -> okolica

Jak czytac ten aneks:

- `aktywacja` = po pobudzeniu receptora rosnie firing, release albo wyjscie lokalnego wezla
- `inhibicja` = po pobudzeniu receptora spada firing, release albo wyjscie lokalnego wezla
- `modulacja` = znak netto zalezy od typu neuronu, kompartmentu albo stanu sieci
- przy receptorach typu MOR, CB1, D2 albo A2A wpis uwzglednia efekt lokalny wraz z najwazniejszym skutkiem obwodowym netto

## Dopaminowy - znak i efekt

| ID | Polaczenia atlasowe z oznaczeniem | Efekt ogolny |
| --- | --- | --- |
| DA_D1 | prazenie direct pathway -> aktywacja; PFC -> modulacja wzmacniajaca sygnal | sprzyja inicjacji dzialania, selekcji reakcji i uczeniu nagrody |
| DA_D2 | prazenie indirect MSN -> inhibicja; VTA/SNc autoreceptor -> inhibicja | tlumi nadmiar dopaminy i odhamowuje ruch przez oslabienie szlaku indirect |
| DA_D3 | accumbens shell -> inhibicja; limbiczne terminale DA -> modulacja hamujaca | zmniejsza nadmierna salience i wzmacnia komponent antynagrodowy |
| DA_D4 | PFC -> inhibicja; hipokamp/amygdala -> modulacja hamujaca | ogranicza nadmierna pobudliwosc korowa, impulsywnosc i reaktywnosc emocjonalna |
| DA_D5 | hipokamp -> aktywacja; podwzgorze/wzgorze -> modulacja aktywujaca | wzmacnia pobudliwosc, komponent Ca2+ i funkcje pamieciowo-neuroendokrynne |

## Noradrenergiczny - znak i efekt

| ID | Polaczenia atlasowe z oznaczeniem | Efekt ogolny |
| --- | --- | --- |
| NE_a1 | PFC/hipokamp -> aktywacja; amygdala -> aktywacja salience | podnosi czuwanie, sensory gating i gotowosc stresowa |
| NE_a2 | LC autoreceptor -> inhibicja; PFC -> inhibicja szumu i stabilizacja sieci | poprawia fokus, ogranicza impulsywnosc i wspiera analgezje/autonomie |
| NE_b1 | kora/hipokamp -> aktywacja; amygdala -> aktywacja konsolidacji emocjonalnej | zwieksza pobudliwosc, konsolidacje pamieci i odpowiedz alarmowa |
| NE_b2 | hipokamp/astrocyty -> aktywacja lub modulacja; kora -> modulacja energetyczna | wspiera plastycznosc, neurovascular coupling i odzyskiwanie po stresie |
| NE_b3 | podwzgorze/pien mozgu -> modulacja | reguluje bilans energetyczny i autonomie, z mala rola poznawcza |

## Serotoninowy i melatoninowy - znak i efekt

| ID | Polaczenia atlasowe z oznaczeniem | Efekt ogolny |
| --- | --- | --- |
| 5HT_1A | jadra szwu -> inhibicja; hipokamp/PFC -> inhibicja | hamuje firing 5-HT i zwykle dziala anksjolitycznie oraz przeciwstresowo |
| 5HT_1B | terminale w prazeniu/korze -> inhibicja release; uklad trigeminowaskularny -> inhibicja | tlumi wyrzut 5-HT, glutaminianu i DA oraz ogranicza sygnal migrenowy |
| 5HT_2A | kora asocjacyjna/PFC -> aktywacja; wzgorze -> aktywacja integracji sensorycznej | nasila pobudzenie piramidowe, percepcje i plastycznosc korowa |
| 5HT_2B | splot naczyniowy/naczynia -> modulacja | dziala glownie naczyniowo-CSF, a nie jako klasyczny wzmacniacz obwodu neuronalnego |
| 5HT_2C | podwzgorze -> aktywacja sytnosci; VTA/NAc -> modulacja z czestym netto hamowaniem DA | ogranicza apetyt, impulsywnosc i nadmierna dopaminergie mezolimbiczna |
| 5HT_3 | area postrema/NTS -> aktywacja; interneurony hipokampa/amygdali -> aktywacja | daje szybka transmisje kationowa, napedza odruch wymiotny i zmienia prog leku/bolu |
| 5HT_4 | hipokamp -> aktywacja; pień oddechowy -> aktywacja | ulatwia uwalnianie ACh, plastycznosc i moze wspierac naped oddechowy |
| 5HT_1D | terminale trigeminalne/pien mozgu -> inhibicja | tlumi neuropeptydy i przewodzenie zwiazane z migrena oraz bolem |
| 5HT_1F | drogi trigeminalne/rog grzbietowy -> inhibicja | daje efekt przeciwmigrenowy i antynocyceptywny bez silnej komponenty naczyniowej |
| 5HT_5A | SCN/podwzgorze -> inhibicja; kora/hipokamp -> modulacja hamujaca | uspokaja rytmike okołodobowa i ogranicza pobudzenie w wybranych sieciach |
| 5HT_6 | prazenie/kora -> modulacja zwykle aktywujaca cAMP | stroi poznanie, apetyt i habit learning bardziej niz daje prosty znak plus/minus |
| 5HT_7 | wzgorze/SCN/hipokamp -> aktywacja lub modulacja | reguluje rytm dobowy, plastycznosc i ton nastroju |
| 5HT_MT1 | SCN -> inhibicja | wycisza zegar biologiczny i ulatwia wejscie w sen |
| 5HT_MT2 | SCN/wzgorze -> inhibicja z przesunieciem fazy | synchronizuje rytm dobowy i odpowiedz na swiatlo |

## Cholinergiczny - znak i efekt

| ID | Polaczenia atlasowe z oznaczeniem | Efekt ogolny |
| --- | --- | --- |
| ACh_nAChR | wzgorze/kora -> aktywacja; VTA -> aktywacja; habenula-IPN -> aktywacja awersyjna | poprawia uwage i sensory gating, ale moze tez wzmacniac nagrode lub awersje nikotynowa zalezne od obwodu |
| ACh_M1 | kora/hipokamp/prazenie -> aktywacja | zwieksza pobudliwosc i plastycznosc, wspiera pamiec oraz integracje korowa |
| ACh_M2 | terminale cholinergiczne -> inhibicja; hipokamp/kora -> modulacja hamujaca | stanowi cholinergiczny feedback, ogranicza release ACh i sprzyja stanom spoczynkowym |
| ACh_M3 | podwzgorze/wybrane neurony GABA -> aktywacja lub modulacja | lokalnie wzmacnia odpowiedzi autonomiczne i neuroendokrynne, ale rola OUN jest wtórna |
| ACh_M4 | prazenie D1-MSN -> inhibicja; kora/hipokamp -> modulacja hamujaca | zmniejsza sygnal nagrody i nadmierne pobudzenie dopaminowe, daje profil przeciwpsychotyczny |
| ACh_M5 | VTA/SNc -> aktywacja; naczynia mozgowe -> aktywacja | ulatwia wyrzut dopaminy i sprzyja cholinergicznej regulacji przeplywu mozgowego |

## Glutaminianowy - znak i efekt

| ID | Polaczenia atlasowe z oznaczeniem | Efekt ogolny |
| --- | --- | --- |
| Glu_NMDA | kora/hipokamp -> aktywacja zalezna od depolaryzacji; wzgorze/prazenie -> aktywacja integracyjna | dziala jako coincidence detector, napedza LTP/LTD i moze dawac ekscytotoksycznosc przy nadmiarze |
| Glu_AMPA | szybkie synapsy pobudzajace -> aktywacja | przenosi glowny szybki EPSC i koduje sile wejsc sensorycznych oraz korowych |
| Glu_KA | hipokamp CA3/interneurony -> aktywacja lub modulacja | wzmacnia odpowiedz na bursty, stroi inhibicje i moze obnizac prog drgawkowy |
| Glu_mGluR1 | Purkinje/PFC/amygdala -> aktywacja modulacyjna | zwieksza wolna pobudliwosc, sprzezenie PLC/Ca2+ i procesy LTD/plastycznosci |
| Glu_mGluR2 | presynaptyczne terminale kory/hipokampa -> inhibicja | ogranicza release glutaminianu, stabilizuje siec i zmniejsza przeciazenie stresem |
| Glu_mGluR4 | presynaptyczne terminale mozdzku/BG/wzgorza -> inhibicja | tlumi uwalnianie neuroprzekaznikow, wygasza nadmierny naped i sprzyja neuroprotekcji |

## GABAergiczny - znak i efekt

| ID | Polaczenia atlasowe z oznaczeniem | Efekt ogolny |
| --- | --- | --- |
| GABA_A | synapsy kora/hipokamp/wzgorze/mozdzek -> inhibicja; receptory extrasynaptyczne -> toniczna inhibicja | szybko obniza pobudliwosc, synchronizuje rytmy i dziala przeciwdrgawkowo/sedacyjnie |
| GABA_B | pre- i postsynaptyczne polaczenia kora/hipokamp/rdzen -> inhibicja | daje wolny hamulec metabotropowy i ogranicza release glutaminianu oraz GABA |

## Histaminowy - znak i efekt

| ID | Polaczenia atlasowe z oznaczeniem | Efekt ogolny |
| --- | --- | --- |
| HA_H1 | kora/wzgorze/podwzgorze -> aktywacja | promuje czuwanie, apetytową salience i integracje przedsionkowo-wymiotna |
| HA_H2 | kora/hipokamp/amygdala -> aktywacja | podnosi pobudliwosc i wspiera konsolidacje pamieci |
| HA_H3 | presynaptyczne terminale histaminy, ACh, DA i NE -> inhibicja | dziala jako autoreceptor/heteroreceptor hamujacy, ogranicza czuwanie i tone poznawcza |
| HA_H4 | mikroglej/komorki immunologiczne -> modulacja | stroi neurozapalnie bardziej niz klasyczna transmisje neuronalna |

## Opioidowy - znak i efekt

| ID | Polaczenia atlasowe z oznaczeniem | Efekt ogolny |
| --- | --- | --- |
| Opi_MOR | PAG/VTA/LC/NTS/rog grzbietowy -> inhibicja lokalna, czesto z disinhibicja sieci | daje analgezje, euforie i depresje oddechowa przez hamowanie lokalnych neuronow GABA lub projekcyjnych |
| Opi_DOR | kora/hipokamp/amygdala -> inhibicja lokalna | zmniejsza bol, wspiera odpornosc na stres i moze lekko poprawiac nastroj |
| Opi_KOR | NAc/VTA/amygdala/PAG -> inhibicja lokalna z netto antydopaminowym skutkiem | generuje dysforie, antynagrode i awersyjna komponentę odpowiedzi stresowej |

## Endokannabinoidowy - znak i efekt

| ID | Polaczenia atlasowe z oznaczeniem | Efekt ogolny |
| --- | --- | --- |
| eCB_CB1 | presynaptyczne terminale kora/hipokamp/BG/mozdzek -> inhibicja release | dziala jako retrograde brake dla GABA i glutaminianu, zmienia pamiec, apetyt i nagrode |
| eCB_CB2 | mikroglej i aktywowane nisze neuronalne -> modulacja z czestym netto hamowaniem zapalenia | wspiera neuroimmunologie, naprawe i ograniczanie odpowiedzi zapalnej |
| eCB_TRPV1 | PAG/rog grzbietowy/amygdala/hipokamp -> aktywacja | moze nasilać nocycepcje lub zmieniac lek i plastycznosc zalezne od miejsca aktywacji |
| eCB_GPR55 | hipokamp/prazenie/mozdzek -> aktywacja lub modulacja | zwieksza pobudliwosc i sygnaly lipidowe, ale mapa czynnosciowa pozostaje niejednolita |

## TAAR - znak i efekt

| ID | Polaczenia atlasowe z oznaczeniem | Efekt ogolny |
| --- | --- | --- |
| TA_TAAR1 | VTA/PFC/jadra podstawy -> modulacja, czesto z netto inhibicja nadmiernej DA | stabilizuje monoaminy, ogranicza hiperDA i ma profil przeciwpsychotyczny/prokognitywny |
| TA_TAAR2 | uklad wechowy i nisze limbiczne -> modulacja | prawdopodobnie stroi sygnaly amin lotnych i salience chemosensoryczna |
| TA_TAAR5 | opuszka wechowa/amygdala/podwzgorze -> aktywacja lub modulacja | laczy bodzce zapachowe z salience emocjonalna i zachowaniem spolecznym |

## Oreksynowy - znak i efekt

| ID | Polaczenia atlasowe z oznaczeniem | Efekt ogolny |
| --- | --- | --- |
| OX_OX1R | LC/VTA/amygdala/insula/BNST -> aktywacja | wzmacnia czuwanie, stres, motywacje i poszukiwanie nagrody |
| OX_OX2R | TMN/jadra szwu/PPT-LDT/podwzgorze -> aktywacja | stabilizuje wakefulness i architekture snu REM/NREM |

## Oksytocyna i wazopresyna - znak i efekt

| ID | Polaczenia atlasowe z oznaczeniem | Efekt ogolny |
| --- | --- | --- |
| OXY_OXTR | amygdala/NAc/lateral septum/podwzgorze -> modulacja, czesto z netto hamowaniem leku | wzmacnia salience spoleczna, przywiazanie i tlumienie reakcji obronnych |
| AVP_V1a | lateral septum/BNST/amygdala/podwzgorze -> aktywacja | nasila pamiec socjalna, czujnosc terytorialna i agresje zalezne od kontekstu |
| AVP_V1b | przysadka/podwzgorze/hipokamp/amygdala -> aktywacja | napedza os HPA i odpowiedz stresowa |
| AVP_V2 | splot naczyniowy/ependymalny -> modulacja slaba | rola centralna jest niewielka w porownaniu z funkcja nerkowa |

## Tachykininowy - znak i efekt

| ID | Polaczenia atlasowe z oznaczeniem | Efekt ogolny |
| --- | --- | --- |
| TK_NK1 | amygdala/PAG/NTS/rog grzbietowy -> aktywacja | wzmacnia bol, stres, lek i odruch wymiotny |
| TK_NK2 | pień mozgu/podwzgorze/obwody trzewne -> modulacja lub aktywacja | wspiera sygnaly interoceptywne i autonomiczne, z mala rola czysto poznawcza |
| TK_NK3 | podwzgorze/SN/VTA/galka blada -> aktywacja | wzmacnia pobudzenie KNDy, modulacje dopaminowa i ton motoryczno-termiczny |

## NPY - znak i efekt

| ID | Polaczenia atlasowe z oznaczeniem | Efekt ogolny |
| --- | --- | --- |
| NPY_Y1 | amygdala/hipokamp/podwzgorze -> inhibicja lokalna | daje anksjolize, tlumi drgawki i wspiera sygnal glodu |
| NPY_Y2 | presynaptyczne terminale hipokampa/kory/amygdali -> inhibicja | ogranicza release NPY i glutaminianu, zmniejsza pobudzenie sieci |
| NPY_Y4 | area postrema/NTS/podwzgorze -> modulacja z netto sytnoscia | integruje sygnaly trzewne i zmniejsza popyt na pokarm |
| NPY_Y5 | jadro lukowate/PVN -> inhibicja lokalna z netto wzrostem laknienia | napedza obwody oreksygenne i homeostaze energetyczna |

## Purynowy i adenozynowy - znak i efekt

| ID | Polaczenia atlasowe z oznaczeniem | Efekt ogolny |
| --- | --- | --- |
| PUR_P2X | neurony i glej hipokampa/kory/pnia -> aktywacja | ATP daje szybki sygnal pobudzajacy i moze wspierac bol oraz neurozapalnie |
| PUR_P2Y | astrocyty/mikroglej/oligodendrocyty -> modulacja | stroi komunikacje neuron-glej, migracje i fagocytoze zamiast prostego znaku plus/minus |
| PUR_A1 | kora/hipokamp/wzgorze/hipotalamus -> inhibicja | wycisza pobudzenie, daje neuroprotekcje i dzialanie usypiajace |
| PUR_A2A | prazenie striatopallidalne -> aktywacja; nizsze poziomy kora/hipokamp -> modulacja | przeciwstawia sie D2, wzmacnia szlak indirect i hamuje nadmierna motoryke/nagrode |
| PUR_A2B | glej i naczynia -> modulacja, czesto prozapalna lub naprawcza | nasila odpowiedz naczyniowo-zapalna bardziej niz szybka transmisje neuronalna |
| PUR_A3 | mikroglej/astrocyty -> modulacja z czesta neuroprotekcja | ogranicza niektore komponenty uszkodzenia i zapalenia, ale mapa funkcji jest nadal rzadsza |

## Krotki wniosek praktyczny

- Najbardziej jednoznacznie aktywujace lokalne obwody: D1, D5, alfa1, beta1, 5-HT2A, 5-HT3, 5-HT4, nAChR, M1, M5, receptory glutaminianowe jonotropowe, H1, H2, OX1R, OX2R, NK1, P2X.
- Najbardziej jednoznacznie hamujace lokalne obwody: D2, D3, D4, alfa2, 5-HT1A/1B/1D/1F, MT1/MT2, M2, M4, mGluR2, mGluR4, GABA_A, GABA_B, H3, MOR, DOR, KOR, CB1, Y1, Y2, A1.
- Najsilniej zalezne od typu komorki i stanu sieci: 5-HT2C, 5-HT6, 5-HT7, CB2, TRPV1, GPR55, OXTR, V1a, V1b, NK2, Y4, Y5, P2Y, A2A, A2B, A3, TAAR.
