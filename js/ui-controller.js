import { apartments, getApartmentsByFloor, getMaxFloor } from './data/apartment-data.js';
import { getStatusText, getStatusColorClass, formatPrice, formatArea } from './utils.js';

/**
 * Klasa kontrolera interfejsu użytkownika
 */
export class UIController {
    constructor() {
        this.selectedApartment = null;
        this.viewMode = '3D';
        this.currentFloor = 0;
        this.onApartmentSelect = null;
        
        this.bindEvents();
    }

    /**
     * Wiąże zdarzenia z elementami UI
     */
    bindEvents() {
        // Przyciski widoku
        document.getElementById('view3D').addEventListener('click', () => {
            this.switchTo3DView();
        });

        document.getElementById('view2D').addEventListener('click', () => {
            this.switchTo2DView();
        });

        // Nawigacja pięter
        document.getElementById('prevFloor').addEventListener('click', () => {
            this.previousFloor();
        });

        document.getElementById('nextFloor').addEventListener('click', () => {
            this.nextFloor();
        });

        // Wyszukiwanie
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
    }

    /**
     * Przełącza na widok 3D
     */
    switchTo3DView() {
        this.viewMode = '3D';
        this.updateViewButtons();
        this.show3DContainer();
        this.hideFloorControls();
        this.updateViewTitle('Widok 3D Budynku');
        this.renderApartmentList();
    }

    /**
     * Przełącza na widok 2D
     */
    switchTo2DView() {
        this.viewMode = '2D';
        this.updateViewButtons();
        this.hide3DContainer();
        this.showFloorControls();
        this.updateFloorView();
        this.renderApartmentList();
    }

    /**
     * Aktualizuje przyciski widoku
     */
    updateViewButtons() {
        const view3DButton = document.getElementById('view3D');
        const view2DButton = document.getElementById('view2D');

        if (this.viewMode === '3D') {
            view3DButton.className = 'px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white';
            view2DButton.className = 'px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300';
        } else {
            view2DButton.className = 'px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white';
            view3DButton.className = 'px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300';
        }
    }

    /**
     * Pokazuje kontener 3D
     */
    show3DContainer() {
        document.getElementById('threeContainer').style.display = 'block';
        document.getElementById('floorView').style.display = 'none';
    }

    /**
     * Ukrywa kontener 3D
     */
    hide3DContainer() {
        document.getElementById('threeContainer').style.display = 'none';
        document.getElementById('floorView').style.display = 'flex';
    }

    /**
     * Pokazuje kontrolki pięter
     */
    showFloorControls() {
        document.getElementById('floorControls').className = 'flex items-center space-x-2';
    }

    /**
     * Ukrywa kontrolki pięter
     */
    hideFloorControls() {
        document.getElementById('floorControls').className = 'hidden items-center space-x-2';
    }

    /**
     * Aktualizuje tytuł widoku
     */
    updateViewTitle(title) {
        document.getElementById('viewTitle').textContent = title;
    }

    /**
     * Przechodzi do poprzedniego piętra
     */
    previousFloor() {
        if (this.currentFloor > 0) {
            this.currentFloor--;
            this.updateFloorView();
            this.renderApartmentList();
        }
    }

    /**
     * Przechodzi do następnego piętra
     */
    nextFloor() {
        const maxFloor = getMaxFloor();
        if (this.currentFloor < maxFloor) {
            this.currentFloor++;
            this.updateFloorView();
            this.renderApartmentList();
        }
    }

    /**
     * Aktualizuje widok piętra
     */
    updateFloorView() {
        this.updateViewTitle(`Piętro ${this.currentFloor}`);
        document.getElementById('floorText').textContent = `Piętro ${this.currentFloor}`;
        
        const floorGrid = document.getElementById('floorGrid');
        const floorApartments = getApartmentsByFloor(this.currentFloor);
        
        floorGrid.innerHTML = '';
        floorApartments.forEach(apt => {
            const apartmentDiv = document.createElement('div');
            apartmentDiv.className = this.getFloorApartmentClass(apt);
            apartmentDiv.textContent = apt.id.split('-')[1];
            apartmentDiv.dataset.apartmentId = apt.id;
            apartmentDiv.addEventListener('click', () => this.selectApartment(apt.id));
            floorGrid.appendChild(apartmentDiv);
        });
    }

    /**
     * Zwraca klasę CSS dla mieszkania na widoku piętra
     */
    getFloorApartmentClass(apartment) {
        const baseClass = 'w-20 h-16 border-2 rounded cursor-pointer flex items-center justify-center text-xs font-medium transition-all';
        const selectedClass = this.selectedApartment === apartment.id ? 'border-blue-500 bg-blue-100' : 'border-gray-300 hover:border-gray-400';
        const statusClass = this.getStatusBackgroundClass(apartment.status);
        
        return `${baseClass} ${selectedClass} ${statusClass}`;
    }

    /**
     * Zwraca klasę tła dla statusu
     */
    getStatusBackgroundClass(status) {
        const statusMap = {
            'available': 'bg-green-100',
            'sold': 'bg-red-100',
            'reserved': 'bg-orange-100'
        };
        return statusMap[status] || 'bg-gray-100';
    }

    /**
     * Renderuje listę mieszkań
     */
    renderApartmentList() {
        const listContainer = document.getElementById('apartmentList');
        const filteredApartments = this.getFilteredApartments();

        listContainer.innerHTML = '';
        
        filteredApartments.forEach(apartment => {
            const item = this.createApartmentListItem(apartment);
            listContainer.appendChild(item);
        });

        this.updateApartmentCount(filteredApartments.length);
    }

    /**
     * Zwraca przefiltrowane mieszkania
     */
    getFilteredApartments() {
        return this.viewMode === '3D' ? 
            apartments : 
            getApartmentsByFloor(this.currentFloor);
    }

    /**
     * Tworzy element listy mieszkania
     */
    createApartmentListItem(apartment) {
        const item = document.createElement('div');
        item.className = this.getApartmentListItemClass(apartment);
        item.dataset.apartmentId = apartment.id;
        
        item.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <span class="font-semibold text-gray-800">${apartment.id}</span>
                <button class="text-gray-400 hover:text-red-500">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                </button>
            </div>
            <div class="text-lg font-bold text-gray-900 mb-1">
                ${formatPrice(apartment.price)}
            </div>
            <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>${formatArea(apartment.area)}</span>
                <span>${apartment.rooms} pokoje</span>
                <span>Piętro ${apartment.floor}</span>
            </div>
            <div class="flex items-center justify-between">
                <span class="text-xs font-medium ${getStatusColorClass(apartment.status)}">
                    ${getStatusText(apartment.status)}
                </span>
                <button class="flex items-center space-x-1 text-blue-500 text-xs hover:text-blue-700">
                    <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    <span>Zobacz</span>
                </button>
            </div>
        `;
        
        item.addEventListener('click', () => this.selectApartment(apartment.id));
        return item;
    }

    /**
     * Zwraca klasę CSS dla elementu listy mieszkania
     */
    getApartmentListItemClass(apartment) {
        const baseClass = 'p-4 border-b border-gray-100 cursor-pointer transition-colors';
        const selectedClass = this.selectedApartment === apartment.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50';
        return `${baseClass} ${selectedClass}`;
    }

    /**
     * Aktualizuje licznik mieszkań
     */
    updateApartmentCount(count) {
        document.getElementById('apartmentCount').textContent = count;
    }

    /**
     * Wybiera mieszkanie
     */
    selectApartment(apartmentId) {
        const previousSelected = this.selectedApartment;
        this.selectedApartment = apartmentId;
        
        // Aktualizuj tylko wybrane elementy zamiast całej listy
        this.updateApartmentSelection(previousSelected, apartmentId);
        
        if (this.onApartmentSelect) {
            this.onApartmentSelect(apartmentId);
        }
    }

    /**
     * Aktualizuje wybór mieszkania bez przebudowywania całej listy
     */
    updateApartmentSelection(previousId, newId) {
        // Aktualizuj listę mieszkań
        const listContainer = document.getElementById('apartmentList');
        const items = listContainer.children;
        
        // Usuń poprzednie zaznaczenie
        if (previousId) {
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.dataset.apartmentId === previousId) {
                    item.className = this.getApartmentListItemClass({ id: previousId });
                    break;
                }
            }
        }
        
        // Dodaj nowe zaznaczenie
        if (newId) {
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.dataset.apartmentId === newId) {
                    item.className = this.getApartmentListItemClass({ id: newId });
                    break;
                }
            }
        }
        
        // Aktualizuj widok 2D jeśli jest aktywny
        if (this.viewMode === '2D') {
            this.updateFloorViewSelection(previousId, newId);
        }
    }

    /**
     * Aktualizuje wybór w widoku 2D bez przebudowywania całej siatki
     */
    updateFloorViewSelection(previousId, newId) {
        const floorGrid = document.getElementById('floorGrid');
        const items = floorGrid.children;
        
        // Usuń poprzednie zaznaczenie
        if (previousId) {
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.dataset.apartmentId === previousId) {
                    const apartment = getApartmentsByFloor(this.currentFloor).find(apt => apt.id === previousId);
                    if (apartment) {
                        item.className = this.getFloorApartmentClass(apartment);
                    }
                    break;
                }
            }
        }
        
        // Dodaj nowe zaznaczenie
        if (newId) {
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.dataset.apartmentId === newId) {
                    const apartment = getApartmentsByFloor(this.currentFloor).find(apt => apt.id === newId);
                    if (apartment) {
                        item.className = this.getFloorApartmentClass(apartment);
                    }
                    break;
                }
            }
        }
    }

    /**
     * Obsługuje wyszukiwanie
     */
    handleSearch(query) {
        // Implementacja wyszukiwania - można rozszerzyć w przyszłości
        console.log('Searching for:', query);
    }

    /**
     * Ustawia callback dla wyboru mieszkania
     */
    setApartmentSelectCallback(callback) {
        this.onApartmentSelect = callback;
    }

    /**
     * Zwraca aktualnie wybrane mieszkanie
     */
    getSelectedApartment() {
        return this.selectedApartment;
    }

    /**
     * Zwraca aktualny tryb widoku
     */
    getViewMode() {
        return this.viewMode;
    }

    /**
     * Zwraca aktualne piętro
     */
    getCurrentFloor() {
        return this.currentFloor;
    }
} 