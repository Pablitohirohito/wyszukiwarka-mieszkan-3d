import { ThreeJSScene } from './threejs-scene.js';
import { UIController } from './ui-controller.js';

/**
 * Główna klasa aplikacji
 */
class ApartmentViewerApp {
    constructor() {
        this.threeScene = null;
        this.uiController = null;
        this.isInitialized = false;
    }

    /**
     * Inicjalizuje aplikację
     */
    async init() {
        try {
            // Sprawdź czy Three.js jest dostępny
            if (typeof THREE === 'undefined') {
                throw new Error('Three.js nie jest załadowany');
            }

            // Inicjalizuj kontroler UI
            this.uiController = new UIController();
            
            // Inicjalizuj scenę Three.js
            this.threeScene = new ThreeJSScene('threeContainer');
            
            // Połącz komponenty
            this.connectComponents();
            
            // Renderuj początkową listę mieszkań
            this.uiController.renderApartmentList();
            
            // Obsługa zmiany rozmiaru okna
            this.setupResizeHandler();
            
            this.isInitialized = true;
            console.log('Aplikacja została zainicjalizowana pomyślnie');
            
        } catch (error) {
            console.error('Błąd podczas inicjalizacji aplikacji:', error);
            this.showErrorMessage('Błąd podczas ładowania aplikacji. Odśwież stronę.');
        }
    }

    /**
     * Łączy komponenty aplikacji
     */
    connectComponents() {
        // Ustaw callback dla wyboru mieszkania w UI
        this.uiController.setApartmentSelectCallback((apartmentId) => {
            this.handleApartmentSelection(apartmentId);
        });

        // Ustaw callback dla kliknięcia mieszkania w scenie 3D
        this.threeScene.setApartmentClickCallback((apartmentId) => {
            this.handleApartmentSelection(apartmentId);
        });
    }

    /**
     * Obsługuje wybór mieszkania
     */
    handleApartmentSelection(apartmentId) {
        // Aktualizuj scenę 3D
        if (this.threeScene) {
            this.threeScene.selectApartment(apartmentId);
        }
        
        // Aktualizuj UI
        if (this.uiController) {
            this.uiController.selectApartment(apartmentId);
        }
        
        console.log('Wybrano mieszkanie:', apartmentId);
    }

    /**
     * Konfiguruje obsługę zmiany rozmiaru okna
     */
    setupResizeHandler() {
        const debouncedResize = this.debounce(() => {
            if (this.threeScene) {
                this.threeScene.handleResize();
            }
        }, 250);

        window.addEventListener('resize', debouncedResize);
    }

    /**
     * Funkcja debounce do ograniczenia częstotliwości wywołań
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Pokazuje komunikat o błędzie
     */
    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    /**
     * Czyści zasoby aplikacji
     */
    dispose() {
        if (this.threeScene) {
            this.threeScene.dispose();
        }
        
        // Usuń event listenery
        window.removeEventListener('resize', this.debouncedResize);
        
        this.isInitialized = false;
        console.log('Zasoby aplikacji zostały wyczyszczone');
    }

    /**
     * Zwraca status inicjalizacji
     */
    isReady() {
        return this.isInitialized;
    }
}

// Inicjalizacja aplikacji po załadowaniu DOM
document.addEventListener('DOMContentLoaded', async () => {
    const app = new ApartmentViewerApp();
    
    try {
        await app.init();
        
        // Eksportuj instancję aplikacji do globalnego scope (opcjonalnie)
        window.apartmentViewerApp = app;
        
    } catch (error) {
        console.error('Nie udało się zainicjalizować aplikacji:', error);
    }
});

// Obsługa błędów nieobsłużonych
window.addEventListener('error', (event) => {
    console.error('Nieobsłużony błąd:', event.error);
});

// Obsługa odrzuconych promes
window.addEventListener('unhandledrejection', (event) => {
    console.error('Nieobsłużona promesa:', event.reason);
});

let autoRotationSpeed = 0.001; // Przykładowa wartość automatycznego obrotu

// Zmniejsz prędkość automatycznego obrotu o 50%
autoRotationSpeed *= 0.5;

model.rotation.y += autoRotationSpeed;