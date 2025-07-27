// Funkcje pomocnicze

/**
 * Konwertuje status mieszkania na tekst
 * @param {string} status - Status mieszkania
 * @returns {string} Tekst statusu
 */
export function getStatusText(status) {
    const statusMap = {
        'available': 'Dostępne',
        'sold': 'Sprzedane',
        'reserved': 'Zarezerwowane'
    };
    return statusMap[status] || 'Nieznany';
}

/**
 * Zwraca klasę CSS dla koloru statusu
 * @param {string} status - Status mieszkania
 * @returns {string} Klasa CSS
 */
export function getStatusColorClass(status) {
    const colorMap = {
        'available': 'text-green-600',
        'sold': 'text-red-600',
        'reserved': 'text-orange-600'
    };
    return colorMap[status] || 'text-gray-600';
}

/**
 * Zwraca kolor Three.js dla statusu
 * @param {string} status - Status mieszkania
 * @returns {number} Kolor w formacie hex
 */
export function getStatusColor(status) {
    const colorMap = {
        'available': 0x4CAF50,
        'sold': 0xf44336,
        'reserved': 0xff9800
    };
    return colorMap[status] || 0x9E9E9E;
}

/**
 * Formatuje cenę w formacie polskim
 * @param {number} price - Cena
 * @returns {string} Sformatowana cena
 */
export function formatPrice(price) {
    return price.toLocaleString('pl-PL') + ' zł';
}

/**
 * Formatuje powierzchnię
 * @param {number} area - Powierzchnia
 * @returns {string} Sformatowana powierzchnia
 */
export function formatArea(area) {
    return `${area} m²`;
}

/**
 * Debounce function - ogranicza częstotliwość wywołań funkcji
 * @param {Function} func - Funkcja do wywołania
 * @param {number} wait - Czas oczekiwania w ms
 * @returns {Function} Funkcja z debounce
 */
export function debounce(func, wait) {
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