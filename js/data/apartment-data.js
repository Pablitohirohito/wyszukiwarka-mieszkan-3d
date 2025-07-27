// Dane mieszkań
export const apartments = [
    { 
        id: 'B4-A004', 
        floor: 0, 
        price: 492540, 
        area: 46.22, 
        rooms: 2, 
        status: 'available', 
        position: { x: -2, y: 0, z: 0 } 
    },
    { 
        id: 'B4-A003', 
        floor: 0, 
        price: 505530, 
        area: 46.56, 
        rooms: 2, 
        status: 'available', 
        position: { x: 0, y: 0, z: 0 } 
    },
    { 
        id: 'B4-A005', 
        floor: 0, 
        price: 483717, 
        area: 46.17, 
        rooms: 2, 
        status: 'sold', 
        position: { x: 2, y: 0, z: 0 } 
    },
    { 
        id: 'B4-A007', 
        floor: 1, 
        price: 465287, 
        area: 45.23, 
        rooms: 2, 
        status: 'available', 
        position: { x: -2, y: 3, z: 0 } 
    },
    { 
        id: 'B4-A008', 
        floor: 1, 
        price: 492540, 
        area: 46.22, 
        rooms: 2, 
        status: 'available', 
        position: { x: 0, y: 3, z: 0 } 
    },
    { 
        id: 'B4-A010', 
        floor: 1, 
        price: 453257, 
        area: 44.23, 
        rooms: 2, 
        status: 'reserved', 
        position: { x: 2, y: 3, z: 0 } 
    },
    { 
        id: 'B4-A011', 
        floor: 2, 
        price: 483640, 
        area: 46.88, 
        rooms: 2, 
        status: 'available', 
        position: { x: -2, y: 6, z: 0 } 
    },
    { 
        id: 'B4-A012', 
        floor: 2, 
        price: 442517, 
        area: 44.25, 
        rooms: 2, 
        status: 'available', 
        position: { x: 0, y: 6, z: 0 } 
    },
    { 
        id: 'B4-A013', 
        floor: 2, 
        price: 386885, 
        area: 38.88, 
        rooms: 1, 
        status: 'available', 
        position: { x: 2, y: 6, z: 0 } 
    }
];

// Funkcje pomocnicze do pracy z danymi
export const getApartmentsByFloor = (floor) => {
    return apartments.filter(apt => apt.floor === floor);
};

export const getApartmentById = (id) => {
    return apartments.find(apt => apt.id === id);
};

export const getMaxFloor = () => {
    return Math.max(...apartments.map(apt => apt.floor));
};

export const getAvailableApartments = () => {
    return apartments.filter(apt => apt.status === 'available');
}; 