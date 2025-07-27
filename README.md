# Wyszukiwarka Mieszkań 3D

Aplikacja do wizualizacji i wyszukiwania mieszkań w budynku z widokiem 3D i 2D.

## Struktura Projektu

```
Makieta wirtualna serwer/
├── index.html              # Główny plik HTML
├── css/
│   └── styles.css          # Style CSS
├── js/
│   ├── main.js             # Główny moduł aplikacji
│   ├── utils.js            # Funkcje pomocnicze
│   ├── ui-controller.js    # Kontroler interfejsu użytkownika
│   ├── threejs-scene.js    # Obsługa sceny Three.js
│   └── data/
│       └── apartment-data.js # Dane mieszkań
└── README.md               # Dokumentacja
```

## Opis Modułów

### 1. `index.html`
- Główny plik HTML z strukturą aplikacji
- Zawiera linki do zewnętrznych bibliotek (Three.js, Tailwind CSS)
- Importuje główny moduł JavaScript

### 2. `css/styles.css`
- Wszystkie style CSS aplikacji
- Responsywne style dla różnych rozmiarów ekranu
- Animacje i efekty wizualne

### 3. `js/main.js`
- Główna klasa `ApartmentViewerApp`
- Koordynuje wszystkie komponenty aplikacji
- Obsługuje inicjalizację i zarządzanie cyklem życia aplikacji
- Obsługuje błędy i komunikację między modułami

### 4. `js/utils.js`
- Funkcje pomocnicze używane w całej aplikacji
- Formatowanie cen, powierzchni, statusów
- Mapowanie kolorów dla różnych statusów mieszkań
- Funkcja debounce do optymalizacji wydajności

### 5. `js/ui-controller.js`
- Klasa `UIController` zarządzająca interfejsem użytkownika
- Obsługa przełączania między widokami 3D/2D
- Renderowanie listy mieszkań
- Nawigacja po piętrach
- Obsługa wyszukiwania

### 6. `js/threejs-scene.js`
- Klasa `ThreeJSScene` zarządzająca sceną 3D
- Tworzenie i konfiguracja sceny Three.js
- Renderowanie budynku i mieszkań
- Obsługa interakcji myszką
- Animacja kamery

### 7. `js/data/apartment-data.js`
- Dane mieszkań w formacie JSON
- Funkcje pomocnicze do filtrowania i wyszukiwania danych
- Eksport danych do innych modułów

## Funkcjonalności

### Widok 3D
- Interaktywna wizualizacja budynku w 3D
- Kolorowe oznaczenie statusu mieszkań
- Animowana kamera
- Kliknięcie na mieszkanie w 3D wybiera je w liście

### Widok 2D
- Widok piętra w formie siatki
- Nawigacja między piętrami
- Kolorowe oznaczenie statusu mieszkań
- Kliknięcie na mieszkanie w 2D wybiera je w liście

### Lista mieszkań
- Wyświetlanie wszystkich mieszkań lub mieszkań z danego piętra
- Informacje o cenie, powierzchni, liczbie pokoi
- Status mieszkań (dostępne, sprzedane, zarezerwowane)
- Wyszukiwanie mieszkań

## Technologie

- **HTML5** - struktura aplikacji
- **CSS3** - style i responsywność
- **JavaScript ES6+** - logika aplikacji
- **Three.js** - grafika 3D
- **Tailwind CSS** - framework CSS
- **ES6 Modules** - modułowa architektura

## Uruchomienie

1. Otwórz plik `index.html` w przeglądarce
2. Aplikacja automatycznie się zainicjalizuje
3. Użyj przycisków "Widok 3D" i "Widok 2D" do przełączania widoków
4. Kliknij na mieszkania w widoku 3D/2D lub w liście, aby je wybrać

## Architektura

Aplikacja została zaprojektowana z myślą o:
- **Modułowości** - każdy moduł ma określoną odpowiedzialność
- **Rozszerzalności** - łatwe dodawanie nowych funkcjonalności
- **Utrzymywalności** - czytelny kod z dokumentacją
- **Wydajności** - optymalizacja renderowania i obsługa błędów

## Rozszerzenia

Możliwe rozszerzenia aplikacji:
- Dodanie filtrów cenowych i powierzchniowych
- Implementacja wyszukiwania tekstowego
- Dodanie szczegółowych informacji o mieszkaniach
- Integracja z API do pobierania danych
- Dodanie animacji przejść między widokami
- Implementacja systemu rezerwacji 