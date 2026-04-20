# NeuroShit - Neuro Atlas

Statyczna aplikacja HTML prezentująca interaktywny atlas neuroprzekaźników, receptorów i regionów mózgu.

## Uruchomienie

1. Otwórz `index.html` w przeglądarce.
2. Alternatywnie uruchom lokalny serwer statyczny (np. Live Server w VS Code).

## Struktura projektu

- `index.html` - struktura aplikacji i legenda
- `styles.css` - style UI i wygląd legendy
- `medical-encyclopedia.js` - encyklopedia danych medycznych (węzły, regiony mózgu, typy połączeń)
- `script.js` - logika renderingu, interakcje i silnik canvas
- `assets/brain-human-lateral-view.svg` - anatomiczna ilustracja mózgu używana jako centralne tło atlasu
- `baza_receptorow_mozg.md` - baza wiedzy receptorów i ich głównych lokalizacji w OUN

## Źródła grafiki

- Tło mózgu: "Brain human lateral view" autorstwa Patrick J. Lynch, CC BY 2.5, źródło: Wikimedia Commons.

## Sterowanie

- Lewy przycisk myszy + przeciąganie - przesuwanie widoku
- Prawy przycisk myszy (przytrzymanie + ruch góra/dół) - płynne przybliżanie/oddalanie
- Kółko myszy / trackpad - przewijanie widoku
- Pinch (trackpad lub dotyk) - zoom
- Kliknięcie receptora lub części mózgu - otwarcie dossier z połączeniami i lokalizacją regionalną
- `+` / `-` / `0` - skróty klawiaturowe zoomu i resetu
