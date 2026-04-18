# NeuroShit - Mapa Biochemiczna

Statyczna aplikacja HTML prezentująca interaktywny schemat cyklu Krebsa.

## Uruchomienie

1. Otwórz `index.html` w przeglądarce.
2. Alternatywnie uruchom lokalny serwer statyczny (np. Live Server w VS Code).

## Struktura projektu

- `index.html` - struktura aplikacji i legenda
- `styles.css` - style UI i wygląd legendy
- `medical-encyclopedia.js` - encyklopedia danych medycznych (węzły, etapy, typy połączeń)
- `script.js` - logika renderingu, interakcje i silnik canvas

## Sterowanie

- Lewy przycisk myszy + przeciąganie - przesuwanie widoku
- Prawy przycisk myszy (przytrzymanie + ruch góra/dół) - płynne przybliżanie/oddalanie
- Kółko myszy / trackpad - przewijanie widoku
- Pinch (trackpad lub dotyk) - zoom
- `+` / `-` / `0` - skróty klawiaturowe zoomu i resetu
