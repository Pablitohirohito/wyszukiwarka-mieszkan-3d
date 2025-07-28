import { apartments } from './data/apartment-data.js';
import { getStatusColor } from './utils.js';

/**
 * Klasa zarządzająca sceną Three.js
 */
export class ThreeJSScene {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.apartmentMeshes = [];
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.animationId = null;
        this.onApartmentClick = null;
        this.previouslySelectedMesh = null;
        this.rotationSpeed = 0.00125;
        this.isMouseDown = false;
        this.lastMouseX = 0;
        this.cameraDistance = 22.5; // Zwiększone z 15 o 50% (15 * 1.5 = 22.5)
        this.minDistance = 5;
        this.maxDistance = 50;
        
        // DODAJ TE ZMIENNE:
        this.autoRotationSpeed = 0.00125; // Prędkość automatycznego obrotu
        this.isAutoRotating = true; // Czy automatyczny obrót jest włączony
        this.lastInteractionTime = 0; // Czas ostatniej interakcji
        this.autoRotationDelay = 3000; // 3 sekundy opóźnienia
        
        this.init();
    }

    /**
     * Inicjalizuje scenę Three.js
     */
    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLighting();
        this.createBuilding();
        this.setupMouseInteraction();
        this.startAnimation();
    }

    /**
     * Konfiguruje scenę
     */
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f8ff);
    }

    /**
     * Konfiguruje kamerę
     */
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75, 
            this.container.offsetWidth / this.container.offsetHeight, 
            0.1, 
            1000
        );
        // Oddal kamerę startową o 50% względem (30, 20, 30)
        this.camera.position.set(45, 30, 45); // (30 * 1.5, 20 * 1.5, 30 * 1.5)
        this.camera.lookAt(0, 5, 0);
    }

    /**
     * Konfiguruje renderer
     */
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);
    }



    /**
     * Konfiguruje oświetlenie
     */
    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
    }

    /**
     * Tworzy budynek i mieszkania
     */
    createBuilding() {
        const buildingGroup = new THREE.Group();
        
        console.log('=== ŁADOWANIE MODELU GLB ===');
        
        // Sprawdź czy loader jest dostępny
        if (typeof THREE.GLTFLoader === 'undefined') {
            console.error('GLTFLoader nie jest dostępny!');
            console.log('Pusta scena - brak loadera');
            this.scene.add(buildingGroup);
            this.createGround();
            return;
        }
        
        const loader = new THREE.GLTFLoader();
        
        loader.load(
            'models/dogbl.glb',
            (gltf) => {
                console.log('SUKCES! Model załadowany:', gltf);
                const model = gltf.scene;
                model.scale.set(1, 1, 1);
                model.position.set(0, 0, 0);
                
                // Sprawdź wszystkie obiekty w modelu
                console.log('=== SPRAWDZANIE OBIEKTÓW W MODELU ===');
                let cameraCount = 0;
                let meshCount = 0;
                
                model.traverse((child) => {
                    console.log('Obiekt:', child.name, 'Typ:', child.type);
                    
                    if (child.isMesh) {
                        meshCount++;
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                    
                    if (child.isCamera) {
                        cameraCount++;
                        console.log('ZNALEZIONO KAMERĘ:', child.name);
                    }
                });
                
                console.log(`Znaleziono ${cameraCount} kamer i ${meshCount} meshów`);
                
                // Szukaj kamery o nazwie 'Camera_MAIN'
                let foundCamera = null;
                model.traverse((child) => {
                    if (child.isCamera && child.name === 'Camera_MAIN') {
                        foundCamera = child;
                        console.log('✅ KAMERA Camera_MAIN ZNALEZIONA!');
                        console.log('Pozycja kamery:', child.position);
                        console.log('Rotacja kamery:', child.rotation);
                    }
                });
                
                if (foundCamera) {
                    this.camera = foundCamera;
                    this.handleResize(); // Zaktualizuj proporcje
                    console.log('✅ Użyto kamery z modelu: Camera_MAIN');
                    console.log('Nowa pozycja kamery:', this.camera.position);
                } else {
                    console.log('❌ KAMERA Camera_MAIN NIE ZNALEZIONA!');
                    console.log('Dostępne kamery:');
                    model.traverse((child) => {
                        if (child.isCamera) {
                            console.log('- ' + child.name);
                        }
                    });
                }
                
                buildingGroup.add(model);
                this.createApartmentOverlays(buildingGroup);
                console.log('Model dogbl.glb załadowany pomyślnie!');
            },
            (progress) => {
                console.log('Progress:', Math.round(progress.loaded / progress.total * 100) + '%');
            },
            (error) => {
                console.error('BŁĄD ładowania modelu:', error);
                console.log('Model nie załadowany - pusta scena');
                // NIE wywołuj createFallbackBuilding() - zostaw pustą scenę
            }
        );
        
        this.scene.add(buildingGroup);
        this.createGround();
    }

    /**
     * Tworzy nakładki mieszkań na model 3D
     */
    createApartmentOverlays(buildingGroup) {
        this.apartmentMeshes = apartments.map(apt => {
            // Zmniejsz rozmiar o 70% (z 3.5x2.5x3 na 1.05x0.75x0.9)
            const geometry = new THREE.BoxGeometry(1.05, 0.75, 0.9);
            const color = getStatusColor(apt.status);
            const material = new THREE.MeshLambertMaterial({ 
                color: color, 
                transparent: true, 
                opacity: 0.8 
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(apt.position.x, apt.position.y + 1.25, apt.position.z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.userData = { apartmentId: apt.id };
            
            buildingGroup.add(mesh);
            return { mesh, apartment: apt };
        });
    }

    /**
     * Tworzy okna dla mieszkania
     */
    createWindows(buildingGroup, position) {
        const windowGeometry = new THREE.BoxGeometry(0.1, 1, 0.8);
        const windowMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x87CEEB, 
            transparent: true, 
            opacity: 0.7 
        });
        
        const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
        window1.position.set(position.x + 1.8, position.y + 1.5, position.z - 0.8);
        buildingGroup.add(window1);
        
        const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
        window2.position.set(position.x + 1.8, position.y + 1.5, position.z + 0.8);
        buildingGroup.add(window2);
    }

    /**
     * Tworzy podłoże
     */
    createGround() {
        const groundGeometry = new THREE.PlaneGeometry(30, 20);
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x90EE90 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -1;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }

    /**
     * Konfiguruje interakcję myszką
     */
    setupMouseInteraction() {
        // Obsługa kliknięć na mieszkania
        this.renderer.domElement.addEventListener('click', (event) => {
            const rect = this.renderer.domElement.getBoundingClientRect();
            this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            this.raycaster.setFromCamera(this.mouse, this.camera);
            const meshes = this.apartmentMeshes.map(({ mesh }) => mesh);
            const intersects = this.raycaster.intersectObjects(meshes);

            if (intersects.length > 0) {
                const clickedMesh = intersects[0].object;
                if (this.onApartmentClick) {
                    this.onApartmentClick(clickedMesh.userData.apartmentId);
                }
            } else {
                // DODAJ TO - kliknięcie poza mieszkaniami zatrzymuje obrót
                this.isAutoRotating = false;
                this.rotationSpeed = 0; // Zatrzymaj obrót
                this.lastInteractionTime = Date.now();
                console.log('Kliknięcie zatrzymało obrót');
            }
        });

        // Obsługa ruchu myszką dla kontroli obrotu
        this.renderer.domElement.addEventListener('mousedown', (event) => {
            this.isMouseDown = true;
            this.lastMouseX = event.clientX;
        });

        this.renderer.domElement.addEventListener('mousemove', (event) => {
            if (this.isMouseDown) {
                const deltaX = event.clientX - this.lastMouseX;
                
                // Ustaw stałą prędkość na podstawie kierunku ruchu:
                if (deltaX > 0) {
                    this.rotationSpeed = 0.01; // Stała prędkość w prawo
                } else if (deltaX < 0) {
                    this.rotationSpeed = -0.01; // Stała prędkość w lewo
                }
                
                this.lastMouseX = event.clientX;
                
                // Zatrzymaj automatyczny obrót i zapisz czas:
                this.isAutoRotating = false;
                this.lastInteractionTime = Date.now();
            }
        });

        this.renderer.domElement.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });

        this.renderer.domElement.addEventListener('mouseleave', () => {
            this.isMouseDown = false;
        });

        // Dodajemy obsługę kółka myszy dla przybliżania/oddalania
        this.renderer.domElement.addEventListener('wheel', (event) => {
            event.preventDefault();
            
            // Zmień odległość kamery
            this.cameraDistance += event.deltaY * 0.01;
            
            // Ogranicz odległość do min/max
            this.cameraDistance = Math.max(this.minDistance, Math.min(this.maxDistance, this.cameraDistance));
            
            console.log('Odległość kamery:', this.cameraDistance);
        });
    }

    /**
     * Rozpoczyna animację kamery
     */
    startAnimation() {
        let angle = 0;
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);
            
            // Sprawdź czy minęło 3 sekundy od ostatniej interakcji
            if (!this.isAutoRotating && Date.now() - this.lastInteractionTime > this.autoRotationDelay) {
                this.isAutoRotating = true;
                this.rotationSpeed = this.autoRotationSpeed; // Przywróć domyślną prędkość
            }
            
            // Użyj odpowiedniej prędkości obrotu
            if (this.isAutoRotating) {
                angle += this.autoRotationSpeed;
            } else {
                angle += this.rotationSpeed;
            }
            
            // Użyj cameraDistance zamiast stałej wartości
            this.camera.position.x = Math.cos(angle) * this.cameraDistance;
            this.camera.position.z = Math.sin(angle) * this.cameraDistance;
            this.camera.position.y = this.cameraDistance * 0.6;
            this.camera.lookAt(0, 5, 0);

            this.renderer.render(this.scene, this.camera);
        };
        animate();
    }

    /**
     * Zatrzymuje animację
     */
    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    /**
     * Wybiera mieszkanie w scenie 3D
     */
    selectApartment(apartmentId) {
        // Użyj requestAnimationFrame dla płynniejszej animacji
        requestAnimationFrame(() => {
            // Znajdź poprzednio wybrane mieszkanie i przywróć jego stan
            if (this.previouslySelectedMesh) {
                this.previouslySelectedMesh.material.emissive.setHex(0x000000);
                this.previouslySelectedMesh.scale.set(1, 1, 1);
            }
            
            // Znajdź nowo wybrane mieszkanie
            const selectedApartment = this.apartmentMeshes.find(({ apartment }) => apartment.id === apartmentId);
            
            if (selectedApartment) {
                selectedApartment.mesh.material.emissive.setHex(0x666666);
                selectedApartment.mesh.scale.set(1.1, 1.1, 1.1);
                this.previouslySelectedMesh = selectedApartment.mesh;
            } else {
                this.previouslySelectedMesh = null;
            }
        });
    }

    /**
     * Obsługuje zmianę rozmiaru okna
     */
    handleResize() {
        if (this.renderer && this.camera) {
            this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        }
    }



    /**
     * Ustawia callback dla kliknięcia mieszkania
     */
    setApartmentClickCallback(callback) {
        this.onApartmentClick = callback;
    }

    /**
     * Czyści zasoby
     */
    dispose() {
        this.stopAnimation();
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}