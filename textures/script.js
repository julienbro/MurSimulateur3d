import { 
    initialCameraPosition, 
    initialCameraLookAt, 
    snapGridSize, 
    TAP_DURATION_THRESHOLD, 
    DRAG_MOVEMENT_THRESHOLD, 
    elementColors, 
    // colorPalette, // Now used by uiUtils
    // texturePaletteURLs // Now used by uiUtils
} from './config.js';
import { 
    domElements, 
    cacheDomElements, 
    updateCursorStyle, 
    updateHelpBar, 
    updateActiveToolButton,
    updateTooltipPosition as uiUpdateTooltipPosition, // Renamed to avoid conflict if a local one exists
    showAndPositionTooltip as uiShowAndPositionTooltip,
    hideHeightTooltip as uiHideHeightTooltip,
    createColorPalette as uiCreateColorPalette,
    createTexturePalette as uiCreateTexturePalette,
    updateUndoRedoButtonsUI,
    updateElementCounterUI
} from './uiUtils.js';
// Import other modules like threeSetup, elementManager, utils as they are created/used

document.addEventListener('DOMContentLoaded', () => {
    cacheDomElements(); // Cache all DOM elements first

    // --- THREE.JS SETUP ---
    let scene, camera, renderer, controls, raycaster, mousePointer; 
    let plane; 
    let objects = []; 
    let ghostElement = null; 
    let selectedObject = null;
    let initialPerspectiveFOV;


    // --- APPLICATION STATE ---
    let currentTool = 'add'; 
    let isGhostFixed = false; 

    let useWhiteElements = false;
    let shadowsEnabled = true; 

    // --- COLOR PALETTE ---
    let currentActiveColor = null; 
    let activeSwatchElement = null; 

    // --- TEXTURE STATE ---
    // texturePaletteURLs are in config.js, uiUtils.js will use it directly
    let textureLoader;
    const loadedTextures = {}; // Cache for THREE.Texture objects
    let currentActiveTextureUrl = null;
    let activeTextureSwatchElement = null;

    // --- UNDO/REDO ---
    const undoStack = [];
    const redoStack = [];
    // undoBtn, redoBtn are now in domElements

    // --- TOUCH STATE VARIABLES ---
    let touchStartTime, touchStartPoint = { x: 0, y: 0 };
    let isDraggingWithTouch = false; // True if touch has moved beyond threshold
    // TAP_DURATION_THRESHOLD, DRAG_MOVEMENT_THRESHOLD are in config.js


    // --- DOM ELEMENTS (Most are now accessed via domElements object after cacheDomElements()) ---
    // const canvasContainer = document.getElementById('threejs-canvas'); // Example: Now domElements.canvasContainer
    // ... remove all individual const declarations for DOM elements ...
    // const helpBar = document.getElementById('help-bar'); // Now domElements.helpBar
    // const heightTooltip = document.getElementById('height-tooltip'); // Now domElements.heightTooltip
    // const toolButtons = { ... }; // Now domElements.toolButtons
    // const viewButtons = { ... }; // Now domElements.viewButtons
    // const dpad = { ... }; // Now domElements.dpad

    domElements.exportPrintButton.addEventListener('click', handleExportPDF); 

    let currentSeatingIndex = 0;
    let seatingLevels = { 0: { y: 0, name: "Assise 0 (Niveau 0.00m)" } };

    // --- HELPER FUNCTION ---
    function getSanitizedJointValue(inputId) {
        const inputElement = document.getElementById(inputId);
        const jointCmStr = (inputElement?.value || "1").replace(',', '.'); // Default to 1 cm
        const jointCm = parseFloat(jointCmStr);
        return isNaN(jointCm) ? 0.01 : jointCm / 100; // Convert to meters
    }


    // --- INITIALIZATION ---
    function initThreeJS() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xADD8E6); 

        camera = new THREE.PerspectiveCamera(50, domElements.viewportContainer.clientWidth / domElements.viewportContainer.clientHeight, 0.1, 1000);
        initialPerspectiveFOV = camera.fov;
        camera.position.copy(initialCameraPosition);
        camera.lookAt(initialCameraLookAt);

        renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); 
        renderer.setSize(domElements.viewportContainer.clientWidth, domElements.viewportContainer.clientHeight);
        renderer.shadowMap.enabled = shadowsEnabled; 
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        domElements.canvasContainer.appendChild(renderer.domElement); 

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE };
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = true; 
        controls.minDistance = 0.1; 
        controls.maxDistance = 150; 
        controls.maxPolarAngle = Math.PI - 0.01;
        controls.target.copy(initialCameraLookAt);
        controls.update();

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); 
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); 
        directionalLight.position.set(10, 30, 10);
        directionalLight.castShadow = shadowsEnabled; 
        directionalLight.shadow.mapSize.width = 8192;
        directionalLight.shadow.mapSize.height = 8192; 
        directionalLight.shadow.camera = new THREE.OrthographicCamera(-15, 15, 15, -15, 0.1, 50);
        directionalLight.shadow.bias = -0.00005;
        scene.add(directionalLight);
        
        const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, side: THREE.DoubleSide, roughness: 0.9, metalness: 0.1 });
        planeMaterial.shadowSide = THREE.FrontSide;
        const planeGeometry = new THREE.PlaneGeometry(100, 100);
        plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.receiveShadow = true; 
        plane.name = "GroundPlane";
        scene.add(plane);

        const gridHelper = new THREE.GridHelper(100, 100, 0xaaaaaa, 0xcccccc); 
        gridHelper.name = "GridHelper"; 
        gridHelper.visible = false; 
        scene.add(gridHelper);

        raycaster = new THREE.Raycaster();
        mousePointer = new THREE.Vector2();
        textureLoader = new THREE.TextureLoader();

        window.addEventListener('resize', onWindowResize, false);
        // Mouse events
        domElements.viewportContainer.addEventListener('pointerdown', onViewportPointerDown, false); 
        domElements.viewportContainer.addEventListener('pointermove', onViewportPointerMove, false);
        // Touch events
        domElements.viewportContainer.addEventListener('touchstart', onViewportTouchStart, { passive: false });
        domElements.viewportContainer.addEventListener('touchmove', onViewportTouchMove, { passive: false });
        domElements.viewportContainer.addEventListener('touchend', onViewportTouchEnd, { passive: false });
        domElements.viewportContainer.addEventListener('touchcancel', onViewportTouchEnd, { passive: false }); // Handle cancel as end


        document.addEventListener('keydown', onDocumentKeyDown, false);

        setupUIEventListeners();
        // createColorPalette(); // Now called via uiUtils
        // createTexturePalette(); // Now called via uiUtils
        uiCreateColorPalette(handleColorSelect);
        uiCreateTexturePalette(handleTextureSelect, handleCustomTextureAdded);

        setupDpadControlsInteractions(); 
        updateActiveToolButton(currentTool); 
        updateCursorStyle(currentTool, currentActiveColor, currentActiveTextureUrl);
        updateHelpBar(currentTool, isGhostFixed, selectedObject, currentActiveColor, currentActiveTextureUrl); 
        updateUndoRedoButtons(); // This will become updateUndoRedoButtonsUI
        updateSeatingSelector();
        
        setCurrentTool('add'); 
        animate();
    }

    // --- TOOLTIP FUNCTIONS (now in uiUtils.js, called as uiShowAndPositionTooltip, etc.) ---
    // function updateTooltipPosition(element) { ... } // Moved
    // function showAndPositionTooltip(targetElement, text) { ... } // Moved
    // function hideHeightTooltip() { ... } // Moved


    function setupUIEventListeners() {
        // undoBtn and redoBtn are now domElements.undoBtn and domElements.redoBtn
        // No need to re-assign them here if cacheDomElements did its job.

        domElements.elementTypeSelector.addEventListener('change', () => {
            const selectedOption = domElements.elementTypeSelector.options[domElements.elementTypeSelector.selectedIndex];
            const baseType = selectedOption.value.split('_')[0];

            domElements.customDimsContainer.style.display = domElements.elementTypeSelector.value === 'custom' ? 'inline-flex' : 'none';
            domElements.videDepthContainer.style.display = domElements.elementTypeSelector.value === 'vide' ? 'inline-flex' : 'none';
            
            domElements.brickCutContainer.style.display = baseType === 'brique' ? 'inline-flex' : 'none';
            domElements.blockCutContainer.style.display = baseType === 'bloc' ? 'inline-flex' : 'none';
            domElements.brickCustomCutLengthContainer.style.display = (baseType === 'brique' && domElements.brickCutSelector.value === 'custom_cut') ? 'inline-flex' : 'none';
            domElements.blockCustomCutLengthContainer.style.display = (baseType === 'bloc' && domElements.blockCutSelector.value === 'custom_cut') ? 'inline-flex' : 'none'; 


            if (baseType !== 'brique') {
                domElements.brickCutSelector.value = '1/1'; 
                domElements.brickCustomCutLengthContainer.style.display = 'none';
            }
            if (baseType !== 'bloc') {
                domElements.blockCutSelector.value = '1/1'; 
                domElements.blockCustomCutLengthContainer.style.display = 'none'; 
            }


            if (currentTool === 'add') {
                removeGhostElement(); 
                isGhostFixed = false; 
                createGhostElement(); 
            }
        });

        domElements.brickCutSelector.addEventListener('change', () => {
            domElements.brickCustomCutLengthContainer.style.display = domElements.brickCutSelector.value === 'custom_cut' ? 'inline-flex' : 'none';
            if (currentTool === 'add' && ghostElement && ghostElement.userData.baseType === 'brique') {
                removeGhostElement();
                isGhostFixed = false; 
                createGhostElement();
            }
        });
        domElements.brickCustomCutLengthInput.addEventListener('input', () => {
             if (currentTool === 'add' && ghostElement && ghostElement.userData.baseType === 'brique' && domElements.brickCutSelector.value === 'custom_cut') {
                removeGhostElement();
                isGhostFixed = false; 
                createGhostElement();
            }
        });

        domElements.blockCutSelector.addEventListener('change', () => { 
            domElements.blockCustomCutLengthContainer.style.display = domElements.blockCutSelector.value === 'custom_cut' ? 'inline-flex' : 'none'; 
            if (currentTool === 'add' && ghostElement && ghostElement.userData.baseType === 'bloc') {
                removeGhostElement();
                isGhostFixed = false;
                createGhostElement();
            }
        });
        domElements.blockCustomCutLengthInput.addEventListener('input', () => { 
             if (currentTool === 'add' && ghostElement && ghostElement.userData.baseType === 'bloc' && domElements.blockCutSelector.value === 'custom_cut') {
                removeGhostElement();
                isGhostFixed = false; 
                createGhostElement();
            }
        });

        domElements.videDepthInput.addEventListener('change', () => {
            if (ghostElement && ghostElement.userData.type === 'vide') {
                const newDepth = parseFloat(domElements.videDepthInput.value) / 100; 
                const oldHeight = ghostElement.userData.height;
                const oldWidth = ghostElement.userData.width;
                ghostElement.geometry.dispose(); 
                ghostElement.geometry = new THREE.BoxGeometry(oldWidth, oldHeight, newDepth);
                ghostElement.userData.depth = newDepth;
            }
        });

        function updateGhostPositionFromJointInput(props, jointInputId) {
            if (currentTool === 'add' && ghostElement && props.baseType === ghostElement.userData.baseType) {
                const jointHeightMeters = getSanitizedJointValue(jointInputId);
                const seatingIdxForGhost = props.seatingIndex !== undefined ? props.seatingIndex : currentSeatingIndex;
                const currentLevelYVal = seatingLevels[seatingIdxForGhost] ? seatingLevels[seatingIdxForGhost].y : 0;
                
                let targetBottomY = currentLevelYVal;
                if (!ghostElement.userData.snappedToObjectId && (props.baseType === 'brique' || props.baseType === 'bloc')) {
                    targetBottomY += jointHeightMeters;
                }
                ghostElement.position.y = snapToGrid(targetBottomY) + props.height / 2;

                if (isGhostFixed) {
                    const tooltipText = `Haut. ${props.baseType === 'brique' ? 'Brique' : 'Bloc'}: ${(props.height * 100).toFixed(1)} cm, Joint: ${(jointHeightMeters * 100).toFixed(1)} cm, Niveau: ${(ghostElement.position.y + props.height / 2).toFixed(2)} m`;
                    uiShowAndPositionTooltip(ghostElement, tooltipText, camera, renderer);
                } else {
                    uiHideHeightTooltip();
                }
            }
        }

        domElements.jointDistanceInput.addEventListener('input', () => {
            if (ghostElement && ghostElement.userData.baseType === 'brique') {
                updateGhostPositionFromJointInput(ghostElement.userData, 'joint-distance');
            }
        });
        domElements.blockJointDistanceInput.addEventListener('input', () => {
             if (ghostElement && ghostElement.userData.baseType === 'bloc') {
                updateGhostPositionFromJointInput(ghostElement.userData, 'block-joint-distance');
            }
        });


        Object.keys(domElements.toolButtons).forEach(toolName => {
            if(domElements.toolButtons[toolName]) { // Check if button exists
                domElements.toolButtons[toolName].addEventListener('click', () => setCurrentTool(toolName));
            }
        });

        Object.keys(domElements.viewButtons).forEach(viewName => {
            if(domElements.viewButtons[viewName]) { // Check if button exists
                domElements.viewButtons[viewName].addEventListener('click', () => setView(viewName));
            }
        });
        
        if(domElements.undoBtn) domElements.undoBtn.addEventListener('click', undoLastAction);
        if(domElements.redoBtn) domElements.redoBtn.addEventListener('click', redoLastAction);
        if(domElements.undoActionLink) domElements.undoActionLink.addEventListener('click', undoLastAction); 
        if(domElements.redoActionLink) domElements.redoActionLink.addEventListener('click', redoLastAction); 

        if(domElements.newFileBtn) domElements.newFileBtn.addEventListener('click', handleNewFile);
        if(domElements.openFileBtn) domElements.openFileBtn.addEventListener('click', handleOpenFile);
        if(domElements.saveFileBtn) domElements.saveFileBtn.addEventListener('click', handleSaveFile);
        if(domElements.exportPdfBtn) domElements.exportPdfBtn.addEventListener('click', handleExportPDF);
        // domElements.exportPrintButton is already assigned above
        if(domElements.editSelectionBtn) domElements.editSelectionBtn.addEventListener('click', handleEditSelection); 
        if(domElements.styleWhiteBtn) domElements.styleWhiteBtn.addEventListener('click', () => setElementStyle(true));
        if(domElements.styleColorBtn) domElements.styleColorBtn.addEventListener('click', () => setElementStyle(false));
        if(domElements.toggleShadowsBtn) domElements.toggleShadowsBtn.addEventListener('click', toggleAllShadows);
        if(domElements.aboutAppBtn) domElements.aboutAppBtn.addEventListener('click', () => alert('MurSimulate3D\nVersion 1.0.2\nDéveloppé par J.BROHEZ avec Three.js.\nCopyright © 2025 J.BROHEZ\n\nDimensions des éléments: Longueur x Hauteur x Profondeur (Épaisseur du mur)'));
        if(domElements.helpGuideBtn) domElements.helpGuideBtn.addEventListener('click', () => alert('Aide :\n- Barre d\'outils : Sélectionner un outil puis interagir.\n- Ajout : Cliquer sur la grille/objet pour fixer la position initiale du fantôme, ajuster avec le DPad, confirmer avec OK.\n- DPad : Flèches pour déplacer, ↺/↻ pour rotation, ⇞/⇟ pour monter/descendre. Maintenir Maj pour un pas plus grand.\n- Sélection : Cliquer sur un objet pour le sélectionner. Si une couleur est active (palette), elle sera appliquée.\n- Navigation : Clic gauche/droit + glisser = Orbite | Clic milieu + glisser = Pan | Molette = Zoom.\n- Raccourcis : S (Select), A (Add), M (Move), Maj+D (Duplicate), R (Rotate), Suppr (Delete), Entrée (Confirm DPad), Ctrl+Z (Annuler), Ctrl+Y (Rétablir).\n Ctrl+S (Sauvegarder), Ctrl+O (Ouvrir).\n- Barres latérales : Cliquer sur < ou > pour les replier/déplier.'));
    }
    
    // function updateCursorStyle() { ... } // Moved to uiUtils.js
    // function updateHelpBar() { ... } // Moved to uiUtils.js

    function setCurrentTool(tool) {
        if ((currentTool === 'move' || currentTool === 'rotate') && selectedObject && selectedObject.userData.undoInitialTransform) {
            const initialTransform = selectedObject.userData.undoInitialTransform;
            if (!initialTransform.position.equals(selectedObject.position) || initialTransform.rotationY !== selectedObject.rotation.y) {
                pushActionToUndoStack({ type: 'transform', objectId: selectedObject.userData.id, oldTransform: initialTransform, newTransform: { position: selectedObject.position.clone(), rotationY: selectedObject.rotation.y } });
            }
            delete selectedObject.userData.undoInitialTransform;
        }
        currentTool = tool;
        updateActiveToolButton(currentTool); // Uses uiUtils version
        if (tool !== 'select' && currentActiveColor !== null) { 
            if (activeSwatchElement) activeSwatchElement.classList.remove('active-color-swatch');
            currentActiveColor = null; activeSwatchElement = null;
        }
        if (tool !== 'select' && currentActiveTextureUrl !== null) { 
            if (activeTextureSwatchElement) activeTextureSwatchElement.classList.remove('active-texture-swatch');
            currentActiveTextureUrl = null; activeTextureSwatchElement = null;
        }
        updateCursorStyle(currentTool, currentActiveColor, currentActiveTextureUrl); // Uses uiUtils version
        updateHelpBar(currentTool, isGhostFixed, selectedObject, currentActiveColor, currentActiveTextureUrl); // Uses uiUtils version
        if (tool === 'add' || tool === 'select') deselectObject(); 

        if (tool !== 'add' || (tool === 'add' && !isGhostFixed)) { 
            uiHideHeightTooltip();
        }

        if (tool === 'add') {
            if (!ghostElement) createGhostElement();
            if (ghostElement) ghostElement.visible = !isGhostFixed;
            controls.enabled = isGhostFixed; 
            controls.enableRotate = isGhostFixed; 
            controls.enablePan = isGhostFixed;    
        } else {
            removeGhostElement(); 
            controls.enabled = !((tool === 'move' || tool === 'rotate') && selectedObject);  
            controls.enableRotate = true; 
            controls.enablePan = true; 
            isGhostFixed = false;
        }
        if (controls) controls.update(); 
    }

    // function updateActiveToolButton() { ... } // Moved to uiUtils.js

    // --- PALETTE CALLBACKS ---
    function handleColorSelect(colorHex, swatchElement) {
        if (activeSwatchElement === swatchElement) {
            currentActiveColor = null;
            if (activeSwatchElement) activeSwatchElement.classList.remove('active-color-swatch');
            activeSwatchElement = null;
        } else {
            if (activeSwatchElement) activeSwatchElement.classList.remove('active-color-swatch');
            currentActiveColor = colorHex;
            activeSwatchElement = swatchElement;
            if (activeSwatchElement) activeSwatchElement.classList.add('active-color-swatch');

            if (activeTextureSwatchElement) activeTextureSwatchElement.classList.remove('active-texture-swatch');
            currentActiveTextureUrl = null; activeTextureSwatchElement = null;
            setCurrentTool('select');
        }
        updateCursorStyle(currentTool, currentActiveColor, currentActiveTextureUrl);
        updateHelpBar(currentTool, isGhostFixed, selectedObject, currentActiveColor, currentActiveTextureUrl);
    }

    function handleTextureSelect(textureUrl, swatchElement, isCustom) {
        if (activeTextureSwatchElement === swatchElement) {
            currentActiveTextureUrl = null;
            if (activeTextureSwatchElement) activeTextureSwatchElement.classList.remove('active-texture-swatch');
            activeTextureSwatchElement = null;
        } else {
            if (activeTextureSwatchElement) activeTextureSwatchElement.classList.remove('active-texture-swatch');
            currentActiveTextureUrl = textureUrl;
            activeTextureSwatchElement = swatchElement;
            if (activeTextureSwatchElement) activeTextureSwatchElement.classList.add('active-texture-swatch');

            if (activeSwatchElement) activeSwatchElement.classList.remove('active-color-swatch');
            currentActiveColor = null; activeSwatchElement = null;
            setCurrentTool('select');
        }
        updateCursorStyle(currentTool, currentActiveColor, currentActiveTextureUrl);
        updateHelpBar(currentTool, isGhostFixed, selectedObject, currentActiveColor, currentActiveTextureUrl);
    }
    
    function handleCustomTextureAdded(textureUrl, swatchElement) {
        // This callback is mostly for potential future use if script.js needs to react
        // specifically when a *new* custom texture is added, beyond just selecting it.
        // For now, the selection logic is handled by handleTextureSelect.
        console.log("Custom texture added and selected:", textureUrl);
    }


    // function createColorPalette() { ... } // Moved to uiUtils.js
    // function createTexturePalette() { ... } // Moved to uiUtils.js

    // --- HELPER FUNCTIONS ---
    function getElementProperties() {
        const selectedOption = domElements.elementTypeSelector.options[domElements.elementTypeSelector.selectedIndex];
        const typeKey = selectedOption.value; 
        const baseType = typeKey.split('_')[0]; 
        let dims, name, originalName; 
        let cutLength = '1/1'; 
        let widthMultiplier = 1.0;
        let customCutWidthValue = null;

        if (typeKey === 'custom') {
            name = domElements.customNameInput.value.trim() || 'Perso';
            const w = parseFloat(domElements.customWidthInput.value) || 0.2;
            const h = parseFloat(domElements.customHeightInput.value) || 0.1;
            const d = parseFloat(domElements.customDepthInput.value) || 0.1;
            dims = [w, h, d];
            originalName = name; 
        } else {
            originalName = selectedOption.textContent.split(' (')[0]; 
            name = originalName;
            dims = selectedOption.dataset.dims.split(',').map(Number);
            if (typeKey === 'vide') {
                dims[2] = parseFloat(domElements.videDepthInput.value) / 100; 
            }

            if (baseType === 'brique') {
                const selectedCutOption = domElements.brickCutSelector.options[domElements.brickCutSelector.selectedIndex];
                cutLength = selectedCutOption.value;
                if (cutLength === 'custom_cut') {
                    customCutWidthValue = parseFloat(domElements.brickCustomCutLengthInput.value) / 100;
                    if (isNaN(customCutWidthValue) || customCutWidthValue <= 0) customCutWidthValue = dims[0]; // Default to full if invalid
                    dims[0] = customCutWidthValue;
                    name += ` (Coupe ${(customCutWidthValue * 100).toFixed(1)}cm)`;
                } else {
                    widthMultiplier = parseFloat(selectedCutOption.dataset.multiplier);
                    dims[0] *= widthMultiplier;
                    if (cutLength !== '1/1') name += ` (${selectedCutOption.textContent})`;
                }
                dims[0] = parseFloat(dims[0].toFixed(4)); 
            } else if (baseType === 'bloc') { 
                const selectedBlockCutOption = domElements.blockCutSelector.options[domElements.blockCutSelector.selectedIndex];
                cutLength = selectedBlockCutOption.value;
                if (cutLength === 'custom_cut') {
                    customCutWidthValue = parseFloat(domElements.blockCustomCutLengthInput.value) / 100;
                    if (isNaN(customCutWidthValue) || customCutWidthValue <= 0) customCutWidthValue = dims[0];
                    dims[0] = customCutWidthValue;
                    name += ` (Long. ${(customCutWidthValue * 100).toFixed(1)}cm)`;
                } else {
                    dims[0] = parseFloat(selectedBlockCutOption.dataset.width);
                    if (cutLength !== '1/1') name += ` (${selectedBlockCutOption.textContent})`;
                }
            }
        }
        return { 
            type: typeKey, 
            baseType: baseType, 
            name: name, 
            originalName: originalName, 
            width: dims[0],  
            height: dims[1], 
            depth: dims[2],
            seatingIndex: currentSeatingIndex,
            cutLength: (baseType === 'brique' || baseType === 'bloc') ? cutLength : undefined, 
            widthMultiplier: baseType === 'brique' && cutLength !== 'custom_cut' ? widthMultiplier : 1.0,
            customCutWidthValue: (baseType === 'brique' || baseType === 'bloc') && cutLength === 'custom_cut' ? customCutWidthValue : undefined,
            appliedTextureUrl: ghostElement && ghostElement.userData && ghostElement.userData.appliedTextureUrl ? ghostElement.userData.appliedTextureUrl : null 
        };
    }

    function createGhostElement() {
        if (ghostElement) {
            scene.remove(ghostElement);
            if (ghostElement.geometry) ghostElement.geometry.dispose();
            if (ghostElement.material) ghostElement.material.dispose();
            ghostElement = null;
        }

        const props = getElementProperties();
        const geometry = new THREE.BoxGeometry(props.width, props.height, props.depth);
        const material = new THREE.MeshStandardMaterial({ color: 0x03A9F4, opacity: 0.6, transparent: true, roughness: 0.8, metalness: 0.1 });
        ghostElement = new THREE.Mesh(geometry, material);
        ghostElement.userData = { ...props, isGhost: true };

        let jointHeightMeters = 0;
        if (props.baseType === 'brique') {
            jointHeightMeters = getSanitizedJointValue('joint-distance');
        } else if (props.baseType === 'bloc') {
            jointHeightMeters = getSanitizedJointValue('block-joint-distance');
        }

        // Ignore seating levels for vertical placement
        const initialGhostCenterY = snapToGrid(jointHeightMeters) + props.height / 2;
        ghostElement.position.set(0, initialGhostCenterY, 0);

        ghostElement.visible = (currentTool === 'add' && !isGhostFixed);
        scene.add(ghostElement);
        if (!isGhostFixed) uiHideHeightTooltip();
    }

    function removeGhostElement() {
        if (ghostElement) {
            scene.remove(ghostElement);
            if (ghostElement.geometry) ghostElement.geometry.dispose();
            if (ghostElement.material) ghostElement.material.dispose();
            ghostElement = null;
        }
        isGhostFixed = false; 
        uiHideHeightTooltip(); 
    }

    function addElementAtPosition(position, rotationY, propsFromGhost, elementId = null, originalColorOverride = null) {
        const geometry = new THREE.BoxGeometry(propsFromGhost.width, propsFromGhost.height, propsFromGhost.depth);
        const baseColorHex = originalColorOverride !== null ? originalColorOverride : (elementColors[propsFromGhost.baseType] || elementColors.default);
        const material = new THREE.MeshStandardMaterial({
            color: useWhiteElements ? 0xffffff : baseColorHex,
            roughness: 0.7, metalness: 0.2,
            transparent: propsFromGhost.baseType === 'vide',
            opacity: propsFromGhost.baseType === 'vide' ? 0.3 : 1.0, 
            name: propsFromGhost.name 
        });

        const element = new THREE.Mesh(geometry, material);
        element.castShadow = shadowsEnabled && propsFromGhost.baseType !== 'vide';
        element.receiveShadow = shadowsEnabled && propsFromGhost.baseType !== 'vide';
        element.position.copy(position); 
        element.rotation.y = rotationY;
        element.name = propsFromGhost.name; 
        element.userData = {
            ...propsFromGhost, 
            isGhost: false,
            id: elementId || THREE.MathUtils.generateUUID(),
            originalColor: baseColorHex,
            seatingIndex: propsFromGhost.seatingIndex !== undefined ? propsFromGhost.seatingIndex : currentSeatingIndex,
            cutLength: propsFromGhost.cutLength, 
            widthMultiplier: propsFromGhost.widthMultiplier, 
            originalName: propsFromGhost.originalName,
            customCutWidthValue: propsFromGhost.customCutWidthValue,
            appliedTextureUrl: propsFromGhost.appliedTextureUrl || null 
        };
        
        const edges = new THREE.EdgesGeometry(element.geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1.5 });
        const lineSegments = new THREE.LineSegments(edges, lineMaterial);
        lineSegments.name = "elementEdges"; 
        element.add(lineSegments); 
        objects.push(element);
        scene.add(element);
        updateElementCounter(); // This will become updateElementCounterUI(objects)
        return element;
    }

    function confirmPlacement() {
        if (currentTool === 'add' && ghostElement && ghostElement.visible && isGhostFixed) {
            const newElement = addElementAtPosition(ghostElement.position.clone(), ghostElement.rotation.y, ghostElement.userData);
            if (newElement) {
                if (ghostElement.userData.appliedTextureUrl) {
                    applyTextureToObject(newElement, ghostElement.userData.appliedTextureUrl, false); 
                }
                pushActionToUndoStack({ type: 'add', objectId: newElement.userData.id, redoData: cloneObjectDataForUndo(newElement) });
            }
            isGhostFixed = false;
            removeGhostElement(); createGhostElement(); 
            if (ghostElement) ghostElement.visible = true;
            controls.enabled = false; 
            controls.enableRotate = false;
            controls.enablePan = false;

        } else if ((currentTool === 'move' || currentTool === 'rotate') && selectedObject) {
            if (selectedObject.userData.undoInitialTransform) {
                const initial = selectedObject.userData.undoInitialTransform;
                if (!initial.position.equals(selectedObject.position) || initial.rotationY !== selectedObject.rotation.y) {
                    pushActionToUndoStack({ type: 'transform', objectId: selectedObject.userData.id, oldTransform: initial, newTransform: { position: selectedObject.position.clone(), rotationY: selectedObject.rotation.y } });
                }
                delete selectedObject.userData.undoInitialTransform;
            }
            deselectObject(); setCurrentTool('select'); 
        }
        uiHideHeightTooltip(); 
        updateHelpBar(currentTool, isGhostFixed, selectedObject, currentActiveColor, currentActiveTextureUrl);
    }

    function snapToGrid(value) { return Math.round(value / snapGridSize) * snapGridSize; }

    function getSnappedPosition(worldPosition, elementProps) {
        let jointHeightMeters = 0;
        if (elementProps.baseType === 'brique') {
            jointHeightMeters = getSanitizedJointValue('joint-distance');
        } else if (elementProps.baseType === 'bloc') {
            jointHeightMeters = getSanitizedJointValue('block-joint-distance');
        }
        
        const snappedX = snapToGrid(worldPosition.x);
        const snappedZ = snapToGrid(worldPosition.z);

        // Ignore seating levels for vertical placement
        const snappedBottomY = snapToGrid(jointHeightMeters);
        const snappedCenterY = snappedBottomY + elementProps.height / 2; 

        return new THREE.Vector3(snappedX, snappedCenterY, snappedZ);
    }
    
    function moveGhostOrSelected(direction, eventParam) { 
        const target = (currentTool === 'add' && ghostElement && isGhostFixed) ? ghostElement : 
                       ((currentTool === 'move' || currentTool === 'rotate') && selectedObject) ? selectedObject : null;
        if (!target) {
            uiHideHeightTooltip();
            return;
        }
        if (selectedObject && !target.userData.undoInitialTransform && (currentTool === 'move' || currentTool === 'rotate')) {
            target.userData.undoInitialTransform = { position: target.position.clone(), rotation: target.rotation.clone() };
        }

        const currentEvent = eventParam || window.event; 
        const useShift = currentEvent ? currentEvent.shiftKey : false;
        const moveAmount = snapGridSize * (useShift ? 10 : 5); 
        const verticalStepInput = document.getElementById('vertical-step-input');
        const heightAdjustAmount = parseFloat(verticalStepInput?.value || "1") / 100; // Convert cm to meters

        switch (direction) {
            case 'forward':
                target.position.z -= moveAmount;
                break;
            case 'backward':
                target.position.z += moveAmount;
                break;
            case 'left':
                target.position.x -= moveAmount;
                break;
            case 'right':
                target.position.x += moveAmount;
                break;
            case 'up':
                target.position.y += heightAdjustAmount;
                break;
            case 'down':
                target.position.y -= heightAdjustAmount;
                break;
        }

        target.position.x = snapToGrid(target.position.x);
        target.position.z = snapToGrid(target.position.z);
        target.position.y = parseFloat(target.position.y.toFixed(5)); 
        updateHelpBar(currentTool, isGhostFixed, selectedObject, currentActiveColor, currentActiveTextureUrl);
    }

    function updateTargetSeatingAfterVerticalMove(target) {
        if (target === ghostElement && isGhostFixed) {
            let jointHeightMeters = 0;
            if (target.userData.baseType === 'brique') {
                jointHeightMeters = getSanitizedJointValue('joint-distance');
            } else if (target.userData.baseType === 'bloc') {
                jointHeightMeters = getSanitizedJointValue('block-joint-distance');
            }

            let ghostBaseY = target.position.y - target.userData.height / 2;
            
            if ((target.userData.baseType === 'brique' || target.userData.baseType === 'bloc') && !target.userData.snappedToObjectId) {
                ghostBaseY -= jointHeightMeters; 
            }

            let closestSeatingId = 0; 
            let minDiff = Infinity;
            for (const id in seatingLevels) {
                const diff = Math.abs(ghostBaseY - seatingLevels[id].y);
                if (diff < minDiff) {
                    minDiff = diff;
                    closestSeatingId = parseInt(id);
                }
            }
            if (minDiff < snapGridSize * 2) { 
                 ghostElement.userData.seatingIndex = closestSeatingId;
                 const newSeatingY = seatingLevels[closestSeatingId].y;
                 let targetBottomForSnap = newSeatingY;
                 if ((target.userData.baseType === 'brique' || target.userData.baseType === 'bloc') && !target.userData.snappedToObjectId) {
                    targetBottomForSnap += jointHeightMeters;
                 }
                 target.position.y = snapToGrid(targetBottomForSnap) + target.userData.height / 2;
            }
        }
    }

    function rotateGhostOrSelected(direction, eventParam) { 
        const target = (currentTool === 'add' && ghostElement && isGhostFixed) ? ghostElement : 
                       ((currentTool === 'rotate' || currentTool === 'move') && selectedObject) ? selectedObject : null;
        if (!target) return;
        if (selectedObject && !target.userData.undoInitialTransform && (currentTool === 'move' || currentTool === 'rotate')) {
            target.userData.undoInitialTransform = { position: target.position.clone(), rotation: target.rotation.clone() };
        }
        const currentEvent = eventParam || window.event;
        const useShift = currentEvent ? currentEvent.shiftKey : false;
        const rotAmount = Math.PI / (useShift ? 18 : 36); 
        target.rotation.y += (direction === 'left' ? rotAmount : -rotAmount);
        if (target === ghostElement) uiHideHeightTooltip(); 
    }

    function selectObject(object) {
        if (selectedObject === object) return; 
        if (selectedObject && selectedObject.userData.undoInitialTransform) {
            const initial = selectedObject.userData.undoInitialTransform;
            if (!initial.position.equals(selectedObject.position) || initial.rotationY !== selectedObject.rotation.y) {
                pushActionToUndoStack({ type: 'transform', objectId: selectedObject.userData.id, oldTransform: { position: initial.position.clone(), rotationY: initial.rotationY }, newTransform: { position: selectedObject.position.clone(), rotationY: selectedObject.rotation.y } });
            }
            delete selectedObject.userData.undoInitialTransform;
        }
        deselectObject(); 
        selectedObject = object;
        if (selectedObject && selectedObject.userData && (selectedObject.userData.isGhost === undefined || selectedObject.userData.isGhost === false)) { 
            selectedObject.userData.originalMaterialParams = { color: selectedObject.userData.originalColor || selectedObject.material.color.getHex(), emissive: selectedObject.material.emissive ? selectedObject.material.emissive.getHex() : 0x000000 };
            selectedObject.userData.originalScale = selectedObject.scale.clone();
            selectedObject.material.color.set(0x00ff00); selectedObject.material.emissive = new THREE.Color(0x003300); 
            selectedObject.material.needsUpdate = true; selectedObject.scale.multiplyScalar(1.05); 
            if (currentTool === 'move' || currentTool === 'rotate') {
                controls.enabled = false; 
                selectedObject.userData.undoInitialTransform = { position: selectedObject.position.clone(), rotationY: selectedObject.rotation.y };
            } else { controls.enabled = true; }
        } else { 
            selectedObject = null; 
            if (currentTool !== 'add') controls.enabled = true;
        }
        if(controls) controls.update(); 
        updateHelpBar(currentTool, isGhostFixed, selectedObject, currentActiveColor, currentActiveTextureUrl);
    }

    function deselectObject() {
        if (selectedObject && selectedObject.userData && selectedObject.userData.isGhost !== true) { 
            if (selectedObject.userData.originalMaterialParams) {
                selectedObject.material.color.setHex(selectedObject.userData.originalMaterialParams.color);
                selectedObject.material.emissive.setHex(selectedObject.userData.originalMaterialParams.emissive);
                selectedObject.material.needsUpdate = true; delete selectedObject.userData.originalMaterialParams; 
            }
            if (selectedObject.userData.originalScale) {
                selectedObject.scale.copy(selectedObject.userData.originalScale); delete selectedObject.userData.originalScale; 
            }
            if (selectedObject.userData.undoInitialTransform) { 
                 const initial = selectedObject.userData.undoInitialTransform;
                 if (!initial.position.equals(selectedObject.position) || initial.rotationY !== selectedObject.rotation.y) {
                    pushActionToUndoStack({ type: 'transform', objectId: selectedObject.userData.id, oldTransform: initial, newTransform: { position: selectedObject.position.clone(), rotationY: selectedObject.rotation.y } });
                 }
                delete selectedObject.userData.undoInitialTransform;
            }
        }
        selectedObject = null; 
        if (currentTool !== 'add') { 
            controls.enabled = true; controls.enableRotate = true; 
            if(controls) controls.update();
        }
        if (currentTool !== 'add') isGhostFixed = false; 
        uiHideHeightTooltip(); 
        updateHelpBar(currentTool, isGhostFixed, selectedObject, currentActiveColor, currentActiveTextureUrl);
    }

    function onWindowResize() {
        const newWidth = domElements.viewportContainer.clientWidth, newHeight = domElements.viewportContainer.clientHeight;
        camera.aspect = newWidth / newHeight; camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
    }

    function updateGhostOnIntersection(raycasterInstance, isInitialPlacement = false) {
        if (!ghostElement || currentTool !== 'add' || (isGhostFixed && !isInitialPlacement)) return;

        let snappedToExistingObjectSurface = false;
        const potentialSnapTargets = objects.filter(o => o !== ghostElement && o.userData && !o.userData.isGhost && o.geometry && o.material && o.visible);
        const intersectsObjects = raycasterInstance.intersectObjects(potentialSnapTargets, false);

        if (intersectsObjects.length > 0) {
            const intersect = intersectsObjects[0];
            const intersectedObject = intersect.object;
            const point = intersect.point;
            const worldNormal = intersect.face.normal.clone().applyMatrix4(intersectedObject.matrixWorld).sub(intersectedObject.getWorldPosition(new THREE.Vector3())).normalize();

            if (worldNormal.y > 0.85) { 
                let jointHeightMeters = 0;
                if (ghostElement.userData.baseType === 'brique') jointHeightMeters = getSanitizedJointValue('joint-distance');
                else if (ghostElement.userData.baseType === 'bloc') jointHeightMeters = getSanitizedJointValue('block-joint-distance');
                
                let yPositionForGhostBase = intersectedObject.position.y + intersectedObject.userData.height / 2; 
                if (ghostElement.userData.baseType === 'brique' || ghostElement.userData.baseType === 'bloc') yPositionForGhostBase += jointHeightMeters; 
                
                ghostElement.position.y = snapToGrid(yPositionForGhostBase) + ghostElement.userData.height / 2; 
                ghostElement.position.x = snapToGrid(point.x); 
                ghostElement.position.z = snapToGrid(point.z);
                ghostElement.material.color.setHex(0x4CAF50); 
                ghostElement.material.opacity = 0.7;
                snappedToExistingObjectSurface = true;
                ghostElement.userData.snappedToObjectId = intersectedObject.userData.id;
                ghostElement.userData.seatingIndex = intersectedObject.userData.seatingIndex; 
            }
        }

        if (!snappedToExistingObjectSurface) {
            delete ghostElement.userData.snappedToObjectId;
            const intersectsPlane = raycasterInstance.intersectObject(plane);
            if (intersectsPlane.length > 0) {
                const intersectPoint = intersectsPlane[0].point;
                if (ghostElement.userData.seatingIndex === undefined) ghostElement.userData.seatingIndex = currentSeatingIndex;
                ghostElement.position.copy(getSnappedPosition(intersectPoint, ghostElement.userData));
                ghostElement.material.color.setHex(0x03A9F4); ghostElement.material.opacity = 0.6;
            }
        }
        if (ghostElement.material.needsUpdate !== undefined) ghostElement.material.needsUpdate = true;
        uiHideHeightTooltip();
    }

    function handleTapOrClick(screenX, screenY) {
        const rect = domElements.viewportContainer.getBoundingClientRect();
        mousePointer.x = ((screenX - rect.left) / rect.width) * 2 - 1;
        mousePointer.y = -((screenY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mousePointer, camera);

        if (currentTool === 'select') {
            const intersectsObjects = raycaster.intersectObjects(objects, false);
            if (intersectsObjects.length > 0) {
                const clickedObject = intersectsObjects[0].object;
                if (clickedObject !== plane && clickedObject.name !== "GridHelper" && clickedObject.userData && !clickedObject.userData.isGhost) {
                    if (currentActiveTextureUrl) { 
                        applyTextureToObject(clickedObject, currentActiveTextureUrl);
                        if (activeTextureSwatchElement) activeTextureSwatchElement.classList.remove('active-texture-swatch');
                        currentActiveTextureUrl = null; activeTextureSwatchElement = null;
                        updateCursorStyle(currentTool, currentActiveColor, currentActiveTextureUrl); 
                        updateHelpBar(currentTool, isGhostFixed, selectedObject, currentActiveColor, currentActiveTextureUrl);
                    } else if (currentActiveColor !== null) {
                        applyColorToObject(clickedObject, currentActiveColor);
                        if (activeSwatchElement) activeSwatchElement.classList.remove('active-color-swatch'); // Corrected this line
                        currentActiveColor = null; activeSwatchElement = null;
                        updateCursorStyle(currentTool, currentActiveColor, currentActiveTextureUrl); 
                        updateHelpBar(currentTool, isGhostFixed, selectedObject, currentActiveColor, currentActiveTextureUrl);
                    } else {
                        selectObject(clickedObject);
                    }
                } else { deselectObject(); }
            } else { deselectObject(); }
        } else if (currentTool === 'move' || currentTool === 'duplicate' || currentTool === 'rotate' || currentTool === 'delete') {
            const intersectsObjects = raycaster.intersectObjects(objects, false); 
            if (intersectsObjects.length > 0) {
                const clickedObject = intersectsObjects[0].object;
                if (clickedObject !== plane && clickedObject.name !== "GridHelper" && clickedObject.userData && !clickedObject.userData.isGhost) {
                    selectObject(clickedObject);
                    if (currentTool === 'duplicate') { duplicateObject(selectedObject); }
                    else if (currentTool === 'delete') deleteObject(clickedObject);
                } else { deselectObject(); }
            } else { deselectObject(); }
        }
    }

    function showTooltipForFixedGhost() {
        if (ghostElement && isGhostFixed && (ghostElement.userData.baseType === 'brique' || ghostElement.userData.baseType === 'bloc')) {
            let tooltipText = ""; 
            const elementHeight = ghostElement.userData.height; 
            const jointInputId = ghostElement.userData.baseType === 'brique' ? 'joint-distance' : 'block-joint-distance';
            const currentJointCm = parseFloat((document.getElementById(jointInputId).value || "0").replace(',', '.'));
            
            if (typeof elementHeight === 'number' && !isNaN(elementHeight)) {
                const topFaceYAbsolute = ghostElement.position.y + elementHeight / 2; 
                const currentSeatingLevelYForTooltip = seatingLevels[ghostElement.userData.seatingIndex !== undefined ? ghostElement.userData.seatingIndex : currentSeatingIndex] ? seatingLevels[ghostElement.userData.seatingIndex !== undefined ? ghostElement.userData.seatingIndex : currentSeatingIndex].y : 0;
                
                if (ghostElement.userData.snappedToObjectId) { 
                    tooltipText = `Haut. ${ghostElement.userData.baseType === 'brique' ? 'Brique' : 'Bloc'}: ${(elementHeight * 100).toFixed(1)} cm`;
                } else {
                    tooltipText = `Haut. ${ghostElement.userData.baseType === 'brique' ? 'Brique' : 'Bloc'}: ${(elementHeight * 100).toFixed(1)} cm, Joint: ${currentJointCm.toFixed(1)} cm, Niveau: ${topFaceYAbsolute.toFixed(2)} m`;
                }
            } else {
                tooltipText = "Erreur calcul hauteur"; 
            }
            uiShowAndPositionTooltip(ghostElement, tooltipText, camera, renderer);
        }
    }


    function onViewportPointerDown(event) {
        const dpadContainer = domElements.dpadControlsContainer; // Use cached element
        if (dpadContainer && dpadContainer.contains(event.target)) return; 
        
        if (event.pointerType === 'mouse' || event.pointerType === undefined) {
            if (event.button === 0) { // Left click
                const rect = domElements.viewportContainer.getBoundingClientRect();
                mousePointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
                mousePointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
                raycaster.setFromCamera(mousePointer, camera);

                if (currentTool === 'add') {
                    if (!ghostElement) {
                        createGhostElement(); 
                    }
                    
                    if (ghostElement) {
                        updateGhostOnIntersection(raycaster, true); // Position it at the click, bypassing isGhostFixed check for this call
                        
                        isGhostFixed = true; // Now, mark it as ready for D-Pad adjustment.
                        ghostElement.visible = true; // Ensure it's visible.
                        
                        controls.enabled = true; 
                        controls.enableRotate = true; 
                        controls.enablePan = true; 
                        
                        showTooltipForFixedGhost();
                        updateHelpBar(currentTool, isGhostFixed, selectedObject, currentActiveColor, currentActiveTextureUrl);                    }
                } else {
                    handleTapOrClick(event.clientX, event.clientY);
                }
            }
        }
    }
    
    function onViewportPointerMove(event) {
        if (currentTool !== 'add' || !ghostElement || isGhostFixed) { // isGhostFixed check here is correct for pointer move
            if (controls.enabled && (event.buttons & 1)) { 
                // Let OrbitControls handle
            }
            return;
        }
        if (event.pointerType === 'mouse' || event.pointerType === undefined) {
            const rect = domElements.viewportContainer.getBoundingClientRect();
            mousePointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mousePointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mousePointer, camera);
            updateGhostOnIntersection(raycaster); // Default isInitialPlacement is false
            if(ghostElement) ghostElement.visible = true;
        }
    }

    function onViewportTouchStart(event) {
        event.preventDefault();
        if (event.touches.length === 1) {
            touchStartTime = Date.now();
            touchStartPoint.x = event.touches[0].clientX;
            touchStartPoint.y = event.touches[0].clientY;
            isDraggingWithTouch = false;

            if (currentTool === 'add' && ghostElement && !isGhostFixed) {
                controls.enabled = false; 
            } else {
                controls.enabled = true; 
            }
        } else { 
            controls.enabled = true;
        }
    }

    function onViewportTouchMove(event) {
        event.preventDefault();
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            const deltaX = touch.clientX - touchStartPoint.x;
            const deltaY = touch.clientY - touchStartPoint.y;

            if (Math.sqrt(deltaX * deltaX + deltaY * deltaY) > DRAG_MOVEMENT_THRESHOLD) {
                isDraggingWithTouch = true;
            }

            if (currentTool === 'add' && ghostElement && !isGhostFixed && !controls.enabled) {
                const rect = domElements.viewportContainer.getBoundingClientRect();
                mousePointer.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
                mousePointer.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
                raycaster.setFromCamera(mousePointer, camera);
                updateGhostOnIntersection(raycaster);
                if (ghostElement) ghostElement.visible = true;
            } else if (isDraggingWithTouch) {
                controls.enabled = true;
            }
        } else { 
            controls.enabled = true;
        }
    }

    function onViewportTouchEnd(event) {
        event.preventDefault();
        const touchDuration = Date.now() - touchStartTime;

        if (event.changedTouches.length === 1) {
            const touch = event.changedTouches[0];

            if (currentTool === 'add') {
                if (!isDraggingWithTouch && touchDuration < TAP_DURATION_THRESHOLD) { // TAP
                    if (!ghostElement) {
                        createGhostElement();
                    }
                    if (ghostElement) {
                        const rect = domElements.viewportContainer.getBoundingClientRect();
                        mousePointer.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
                        mousePointer.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
                        raycaster.setFromCamera(mousePointer, camera);
                        
                        updateGhostOnIntersection(raycaster, true); // Position it, bypassing isGhostFixed check for this call
                        
                        isGhostFixed = true; // Now, mark as fixed for D-Pad
                        ghostElement.visible = true;

                        controls.enabled = true; controls.enableRotate = true; controls.enablePan = true;
                        showTooltipForFixedGhost();
                        updateHelpBar(currentTool, isGhostFixed, selectedObject, currentActiveColor, currentActiveTextureUrl);
                    }
                } else if (isDraggingWithTouch && ghostElement) { // DRAGGED ghost to position
                    // Ghost was already positioned by onViewportTouchMove which calls updateGhostOnIntersection
                    // with isGhostFixed = false. So, just mark it as fixed here.
                    isGhostFixed = true; 
                    ghostElement.visible = true;
                    controls.enabled = true; controls.enableRotate = true; controls.enablePan = true;
                    showTooltipForFixedGhost();
                    updateHelpBar(currentTool, isGhostFixed, selectedObject, currentActiveColor, currentActiveTextureUrl);
                } else { 
                     controls.enabled = true; controls.enableRotate = true; controls.enablePan = true;
                }
            } else if (!isDraggingWithTouch && touchDuration < TAP_DURATION_THRESHOLD) { // Not in 'add' tool, regular tap
                handleTapOrClick(touch.clientX, touch.clientY);
                 controls.enabled = true; controls.enableRotate = true; controls.enablePan = true;
            } else { // Not a tap, or not in 'add' tool and was a drag
                controls.enabled = true; controls.enableRotate = true; controls.enablePan = true;
            }
        }
        
        isDraggingWithTouch = false; 
        
        if (currentTool === 'add' && isGhostFixed) {
            controls.enabled = true; 
            controls.enableRotate = true; 
            controls.enablePan = true; 
        } else if (!((currentTool === 'move' || currentTool === 'rotate') && selectedObject)) {
            controls.enabled = true;
            controls.enableRotate = true;
            controls.enablePan = true;
        } else if (((currentTool === 'move' || currentTool === 'rotate') && selectedObject)){
            controls.enabled = false; 
        }


        if(controls) controls.update();
    }


    function onDocumentKeyDown(event) {
        if (document.activeElement && ( document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'SELECT')) {
            if (event.key === 'Escape') {
                uiHideHeightTooltip(); 
                document.activeElement.blur(); 
                if (currentActiveColor) {
                    if(activeSwatchElement) activeSwatchElement.classList.remove('active-color-swatch');
                    currentActiveColor = null; activeSwatchElement = null;
                }
                if (currentActiveTextureUrl) { 
                    if(activeTextureSwatchElement) activeTextureSwatchElement.classList.remove('active-texture-swatch');
                    currentActiveTextureUrl = null; activeTextureSwatchElement = null;
                }
                updateCursorStyle(currentTool, currentActiveColor, currentActiveTextureUrl); 
                updateHelpBar(currentTool, isGhostFixed, selectedObject, currentActiveColor, currentActiveTextureUrl);
            }
            return;
        }
        let dpadAction = true; const isCtrlOrMeta = event.ctrlKey || event.metaKey;
        switch (event.key.toLowerCase()) {
            case 'z': if (isCtrlOrMeta) { event.preventDefault(); undoLastAction(); } else { dpadAction = false; } break;
            case 'y': if (isCtrlOrMeta) { event.preventDefault(); redoLastAction(); } else { dpadAction = false; } break;
            case 's': if (isCtrlOrMeta) { event.preventDefault(); handleSaveFile(); } else if (!event.shiftKey) { setCurrentTool('select'); } else { dpadAction = false; } break;
            case 'a': if (!isCtrlOrMeta && !event.altKey) setCurrentTool('add'); else dpadAction = false; break;
            case 'm': setCurrentTool('move'); break;
            case 'd': if (event.shiftKey && !isCtrlOrMeta) { setCurrentTool('duplicate'); } else { dpadAction = false; } break; 
            case 'r': if (!isCtrlOrMeta) setCurrentTool('rotate'); else dpadAction = false; break; 
            case 'delete': case 'backspace': if (selectedObject) deleteObject(selectedObject); else setCurrentTool('delete'); break;
            case 'enter':
                if ((currentTool === 'add' && ghostElement && ghostElement.visible && isGhostFixed) || ((currentTool === 'move' || currentTool === 'rotate') && selectedObject)) {
                    confirmPlacement();
                }
                break;
            case 'escape':
                uiHideHeightTooltip(); 
                if (currentActiveColor !== null) { if (activeSwatchElement) activeSwatchElement.classList.remove('active-color-swatch'); currentActiveColor = null; activeSwatchElement = null; updateCursorStyle(currentTool, currentActiveColor, currentActiveTextureUrl); updateHelpBar(currentTool, isGhostFixed, selectedObject, currentActiveColor, currentActiveTextureUrl); } 
                else if (currentActiveTextureUrl !== null) { if (activeTextureSwatchElement) activeTextureSwatchElement.classList.remove('active-texture-swatch'); currentActiveTextureUrl = null; activeTextureSwatchElement = null; updateCursorStyle(currentTool, currentActiveColor, currentActiveTextureUrl); updateHelpBar(currentTool, isGhostFixed, selectedObject, currentActiveColor, currentActiveTextureUrl); }
                else if (currentTool === 'add' && ghostElement) { isGhostFixed = false; ghostElement.visible = true; controls.enabled = false; controls.enableRotate = false; controls.enablePan = false; updateHelpBar(currentTool, isGhostFixed, selectedObject, currentActiveColor, currentActiveTextureUrl); } 
                else if (selectedObject) { deselectObject(); }
                break;
            case 'w': case 'arrowup': moveGhostOrSelected('forward', event); break;
            case 'x': case 'arrowdown': moveGhostOrSelected('backward', event); break; 
            case 'j': case 'arrowleft': moveGhostOrSelected('left', event); break;
            case 'l': case 'arrowright': moveGhostOrSelected('right', event); break;
            case 'q': rotateGhostOrSelected('left', event); break;
            case 'e': rotateGhostOrSelected('right', event); break;
            case 'pageup': moveGhostOrSelected('up', event); break;
            case 'pagedown': moveGhostOrSelected('down', event); break;
            case 'o': if (isCtrlOrMeta) { event.preventDefault(); handleOpenFile(); } else { dpadAction = false; } break;
            default: dpadAction = false; break;
        }
        if (dpadAction) event.preventDefault(); 
    }

    function pushActionToUndoStack(action) {
        undoStack.push(action); redoStack.length = 0; 
        updateUndoRedoButtons(); // This will become updateUndoRedoButtonsUI
    }
    function updateUndoRedoButtons() {
        updateUndoRedoButtonsUI(undoStack.length, redoStack.length);
    }
    function getObjectById(id) { return objects.find(obj => obj.userData.id === id); }
    function cloneObjectDataForUndo(object) {
        if (!object || !object.userData) return null;
        return { id: object.userData.id, type: object.userData.type, baseType: object.userData.baseType, name: object.userData.name, originalName: object.userData.originalName, width: object.userData.width, height: object.userData.height, depth: object.userData.depth, originalColor: object.userData.originalColor, seatingIndex: object.userData.seatingIndex, position: object.position.clone(), rotationY: object.rotation.y, cutLength: object.userData.cutLength, widthMultiplier: object.userData.widthMultiplier, customCutWidthValue: object.userData.customCutWidthValue, appliedTextureUrl: object.userData.appliedTextureUrl }; 
    }

    function undoLastAction() {
        if (undoStack.length === 0) return;
        const action = undoStack.pop(); let object;
        switch (action.type) {
            case 'add':
                object = getObjectById(action.objectId);
                if (object) { action.redoData = cloneObjectDataForUndo(object); scene.remove(object); const index = objects.indexOf(object); if (index > -1) objects.splice(index, 1); if (object.geometry) object.geometry.dispose(); if (object.material) { if(Array.isArray(object.material)) object.material.forEach(m=>m.dispose()); else object.material.dispose(); } object.traverse(c => { if ( c.isLineSegments && c.name === "elementEdges") { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); }}); }
                break;
            case 'delete': 
                if (action.objectData) {
                    const reAddedElement = addElementAtPosition(new THREE.Vector3(action.objectData.position.x, action.objectData.position.y, action.objectData.position.z), action.objectData.rotationY, action.objectData, action.objectData.id, action.objectData.originalColor);
                    if (reAddedElement && action.objectData.appliedTextureUrl) { 
                        applyTextureToObject(reAddedElement, action.objectData.appliedTextureUrl, false); 
                    }
                }
                break;
            case 'transform': object = getObjectById(action.objectId); if (object) { object.position.copy(action.oldTransform.position); object.rotation.y = action.oldTransform.rotationY; } break;
                                            

                                             case 'color': 
                object = getObjectById(action.objectId); 
                if (object) { 
                    object.userData.originalColor = action.oldColor; 
                    if (action.oldTextureUrl) { 
                        applyTextureToObject(object, action.oldTextureUrl, false);
                    } else { 
                        object.userData.appliedTextureUrl = null;
                        object.material.map = null;
                        if (!useWhiteElements) object.material.color.setHex(action.oldColor);
                        else object.material.color.setHex(0xffffff);
                        object.material.needsUpdate = true; 
                    }
                } 
                break;
            case 'texture': 
                object = getObjectById(action.objectId);
                if (object) {
                    object.userData.originalColor = action.oldColor; 
                    if (action.oldTextureUrl) {
                        applyTextureToObject(object, action.oldTextureUrl, false);
                    } else { 
                        object.userData.appliedTextureUrl = null;
                        object.material.map = null;
                        if (!useWhiteElements) object.material.color.setHex(action.oldColor);
                        else object.material.color.setHex(0xffffff); 
                        object.material.needsUpdate = true;
                    }
                }
                break;
        }

        redoStack.push(action); 
        updateUndoRedoButtons(); // This will become updateUndoRedoButtonsUI
        updateElementCounter(); // This will become updateElementCounterUI(objects)
    }
    function redoLastAction() {
        if (redoStack.length === 0) return;
        const action = redoStack.pop(); let object;
        switch (action.type) {
            case 'add': 
                if (action.redoData) {
                     const reAddedElement = addElementAtPosition(new THREE.Vector3(action.redoData.position.x, action.redoData.position.y, action.redoData.position.z), action.redoData.rotationY, action.redoData, action.redoData.id, action.redoData.originalColor);
                     if (reAddedElement && action.redoData.appliedTextureUrl) { 
                        applyTextureToObject(reAddedElement, action.redoData.appliedTextureUrl, false);
                     }
                }
                break;
            case 'delete': object = getObjectById(action.objectData.id); if (object) { scene.remove(object); const index = objects.indexOf(object); if (index > -1) objects.splice(index, 1); if (object.geometry) object.geometry.dispose(); if (object.material) { if (Array.isArray(object.material)) object.material.forEach(m => m.dispose()); else object.material.dispose(); } object.traverse(c => { if (c.isLineSegments && c.name === "elementEdges") { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); }});} break;
            case 'transform': object = getObjectById(action.objectId); if (object) { object.position.copy(action.newTransform.position); object.rotation.y = action.newTransform.rotationY; } break;
            case 'color': 
                object = getObjectById(action.objectId); 
                if (object) { 
                    object.userData.originalColor = action.newColor; 
                    object.userData.appliedTextureUrl = null; 
                    object.material.map = null;
                    if (!useWhiteElements) object.material.color.setHex(action.newColor); 
                    else object.material.color.setHex(0xffffff);
                    object.material.needsUpdate = true; 
                } 
                break;
            case 'texture': 
                object = getObjectById(action.objectId);
                if (object) {
                    applyTextureToObject(object, action.newTextureUrl, false);
                }
                break;
        }
        undoStack.push(action); 
        updateUndoRedoButtons(); // This will become updateUndoRedoButtonsUI
        updateElementCounter(); // This will become updateElementCounterUI(objects)
    }

    function applyColorToObject(object, colorHex, addToUndo = true) {
        if (!object || !object.material || object.name === "GridHelper") return;
        const oldColor = object.userData.originalColor;
        const oldTextureUrl = object.userData.appliedTextureUrl; 

        if (addToUndo) {
            pushActionToUndoStack({ type: 'color', objectId: object.userData.id, oldColor: oldColor, newColor: colorHex, oldTextureUrl: oldTextureUrl });
        }

        object.userData.originalColor = colorHex;
        object.userData.appliedTextureUrl = null; 
        object.material.map = null; 
        if (!useWhiteElements) {
            object.material.color.setHex(colorHex);
        } else {
            object.material.color.setHex(0xffffff); 
        }
        object.material.needsUpdate = true;
    }

    function applyTextureToObject(object, textureUrl, addToUndo = true) {
        if (!object || !object.material || !textureUrl || object.name === "GridHelper") return;

        const oldTextureUrl = object.userData.appliedTextureUrl;
        const oldColor = object.userData.originalColor; 

        if (addToUndo && (oldTextureUrl !== textureUrl)) { 
            pushActionToUndoStack({ type: 'texture', objectId: object.userData.id, oldTextureUrl: oldTextureUrl, newTextureUrl: textureUrl, oldColor: oldColor });
        }

        object.userData.appliedTextureUrl = textureUrl;

        if (loadedTextures[textureUrl]) {
            object.material.map = loadedTextures[textureUrl];
            object.material.color.setHex(0xffffff); 
            object.material.needsUpdate = true;
        } else {
            textureLoader.load(textureUrl, (texture) => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                loadedTextures[textureUrl] = texture;
                object.material.map = texture;
                object.material.color.setHex(0xffffff); 
                object.material.needsUpdate = true;
            }, undefined, (err) => {
                console.error('Erreur de chargement de texture:', err);
                object.userData.appliedTextureUrl = oldTextureUrl; 
            });
        }
    }

    function duplicateObject(objectToDuplicate) {
        const sourceObject = objectToDuplicate || selectedObject; if (!sourceObject) return;
        const props = sourceObject.userData; const offset = new THREE.Vector3(props.width * 1.05, 0, 0); 
        const newPosition = sourceObject.position.clone().add(offset);
        const snappedNewPos = new THREE.Vector3(snapToGrid(newPosition.x), sourceObject.position.y, snapToGrid(newPosition.z));
        const newElement = addElementAtPosition(snappedNewPos, sourceObject.rotation.y, props);
        if (newElement) { 
            if (props.appliedTextureUrl) { 
                applyTextureToObject(newElement, props.appliedTextureUrl, false);
            }
            pushActionToUndoStack({ type: 'add', objectId: newElement.userData.id, redoData: cloneObjectDataForUndo(newElement) }); 
            deselectObject(); 
            selectObject(newElement); 
            setCurrentTool('move'); 
        }
    }
    function deleteObject(objectToDelete) {
        const target = objectToDelete || selectedObject; if (!target || target === plane || target === ghostElement) return;
        pushActionToUndoStack({ type: 'delete', objectData: cloneObjectDataForUndo(target) });
        target.traverse((child) => { if (child.isLineSegments && child.name === "elementEdges") { if (child.geometry) child.geometry.dispose(); if (child.material) { if (Array.isArray(child.material)) child.material.forEach(m => m.dispose()); else child.material.dispose(); }}});
        scene.remove(target); const index = objects.indexOf(target); if ( index > -1) objects.splice(index, 1);
        if (target.geometry) target.geometry.dispose(); if (target.material) { if (Array.isArray(target.material)) target.material.forEach(m => m.dispose()); else target.material.dispose(); }
        if (selectedObject === target) deselectObject(); 
        updateElementCounter(); // This will become updateElementCounterUI(objects)
    }

    function handleNewFile() {
        if (!confirm("Créer un nouveau fichier ? Les modifications non sauvegardées seront perdues.")) return;
        while(objects.length > 0) { let o = objects[0]; o.traverse((c => { if (c.isLineSegments && c.name === "elementEdges") { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); }})); scene.remove(o); if (o.geometry) o.geometry.dispose(); if (o.material) { if(Array.isArray(o.material)) o.material.forEach(m=>m.dispose()); else o.material.dispose(); } objects.shift(); }
        if (selectedObject) deselectObject();
        undoStack.length = 0; redoStack.length = 0; 
        updateUndoRedoButtons(); // This will become updateUndoRedoButtonsUI
        seatingLevels = { 0: { y: 0, name: "Assise 0 (Niveau 0.00m)" } }; currentSeatingIndex = 0; updateSeatingSelector();
        updateElementCounter(); // This will become updateElementCounterUI(objects)
        [domElements.projectTitleInput, domElements.designerNameInput, domElements.operatingModeInput, domElements.projectNotesInput].forEach(input => {
            if (input) input.value = ''; // Check if input exists
        });

        if (currentTool === 'add') { removeGhostElement(); createGhostElement(); }
        setCurrentTool('add'); 
        if (controls) { camera.position.copy(initialCameraPosition); controls.target.copy(initialCameraLookAt); controls.update(); }
    }
    function handleOpenFile() {
        const input = document.createElement('input'); input.type = 'file'; input.accept = '.json,application/json';
        input.onchange = e => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = event => { try { const data = JSON.parse(event.target.result); loadSceneData(data); } catch (error) { console.error("Erreur:", error); alert('Erreur: ' + error.message);}}; reader.readAsText(file);};
        input.click();
    }
    function loadSceneData(data) {
        if (!confirm("Charger va remplacer la scène. Continuer ?")) return;
        while(objects.length > 0) { let o = objects[0]; o.traverse((c) => { if (c.isLineSegments && c.name === "elementEdges") { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); }}); scene.remove(o); if (o.geometry) o.geometry.dispose(); if (o.material) { if(Array.isArray(o.material)) o.material.forEach(m=>m.dispose()); else o.material.dispose(); } objects.shift(); }
        if (selectedObject) deselectObject();
        undoStack.length = 0; redoStack.length = 0; 
        updateUndoRedoButtons(); // This will become updateUndoRedoButtonsUI
        [domElements.projectTitleInput, domElements.designerNameInput, domElements.operatingModeInput, domElements.projectNotesInput].forEach(input => {
            if (input) input.value = ''; // Check if input exists
        });
        if (data.metadata) { 
            if(domElements.projectTitleInput) domElements.projectTitleInput.value = data.metadata.projectTitle || ''; 
            if(domElements.designerNameInput) domElements.designerNameInput.value = data.metadata.designerName || ''; 
            if(domElements.operatingModeInput) domElements.operatingModeInput.value = data.metadata.operatingMode || ''; 
            if(domElements.projectNotesInput) domElements.projectNotesInput.value = data.metadata.projectNotes || '';
        }
        seatingLevels = (data.seatingLevels && Object.keys(data.seatingLevels).length > 0) ? data.seatingLevels : { 0: { y: 0, name: "Assise 0 (Niveau 0.00m)" } };
        currentSeatingIndex = data.currentSeatingIndex !== undefined && seatingLevels[data.currentSeatingIndex] ? data.currentSeatingIndex : 0;
        if (!seatingLevels[currentSeatingIndex] && Object.keys(seatingLevels).length > 0) currentSeatingIndex = parseInt(Object.keys(seatingLevels)[0]);
        updateSeatingSelector(); 
        if (data.styleSettings) { useWhiteElements = data.styleSettings.useWhiteElements || false; shadowsEnabled = data.styleSettings.shadowsEnabled !== undefined ? data.styleSettings.shadowsEnabled : true; } else { useWhiteElements = false; shadowsEnabled = true; }
        renderer.shadowMap.enabled = shadowsEnabled; scene.traverse(c => { if (c.isLight) c.castShadow = shadowsEnabled; if (c.isMesh && c.material) c.material.needsUpdate = true; });
        if(domElements.toggleShadowsBtn) domElements.toggleShadowsBtn.textContent = shadowsEnabled ? "Désactiver Ombres" : "Activer Ombres";
        if (data.objects) { data.objects.forEach(objData => { const props = { type: objData.type, baseType: objData.baseType, name: objData.name, originalName: objData.originalName, width: objData.width, height: objData.height, depth: objData.depth, seatingIndex: objData.seatingIndex, cutLength: objData.cutLength, widthMultiplier: objData.widthMultiplier, customCutWidthValue: objData.customCutWidthValue, appliedTextureUrl: objData.appliedTextureUrl }; const pos = new THREE.Vector3(objData.position.x, objData.position.y, objData.position.z); const rotY = objData.rotationY; const origSeatIdx = currentSeatingIndex; currentSeatingIndex = objData.seatingIndex !== undefined && seatingLevels[objData.seatingIndex] ? objData.seatingIndex : 0; if (!seatingLevels[currentSeatingIndex]) currentSeatingIndex = 0; const loadedEl = addElementAtPosition(pos, rotY, props, objData.id, objData.originalColor); if (loadedEl) { loadedEl.castShadow = shadowsEnabled && props.baseType !== 'vide'; loadedEl.receiveShadow = shadowsEnabled && props.baseType !== 'vide'; if (objData.appliedTextureUrl) { applyTextureToObject(loadedEl, objData.appliedTextureUrl, false); } else if (objData.originalColor !== (elementColors[objData.baseType] || elementColors.default) && !useWhiteElements ) { applyColorToObject(loadedEl, objData.originalColor, false); } } currentSeatingIndex = origSeatIdx; }); }
        updateElementCounter(); // This will become updateElementCounterUI(objects)
        if (currentTool === 'add') { removeGhostElement(); createGhostElement(); } setCurrentTool('add'); 
        if (controls) { camera.position.copy(initialCameraPosition); controls.target.copy(initialCameraLookAt); controls.update(); }
    }
    function handleSaveFile() {
        const sceneData = { 
            metadata: { 
                projectTitle: domElements.projectTitleInput ? domElements.projectTitleInput.value : '', 
                designerName: domElements.designerNameInput ? domElements.designerNameInput.value : '', 
                operatingMode: domElements.operatingModeInput ? domElements.operatingModeInput.value : '',
                projectNotes: domElements.projectNotesInput ? domElements.projectNotesInput.value : '' 
            }, 
            objects: objects.map(o => ({ id: o.userData.id, type: o.userData.type, baseType: o.userData.baseType, name: o.userData.name, originalName: o.userData.originalName, width: o.userData.width, height: o.userData.height, depth: o.userData.depth, position: { x: o.position.x, y: o.position.y, z: o.position.z }, rotationY: o.rotation.y, originalColor: o.userData.originalColor, seatingIndex: o.userData.seatingIndex, cutLength: o.userData.cutLength, widthMultiplier: o.userData.widthMultiplier, customCutWidthValue: o.userData.customCutWidthValue, appliedTextureUrl: o.userData.appliedTextureUrl })), 
            seatingLevels: seatingLevels, 
            currentSeatingIndex: currentSeatingIndex, 
            styleSettings: { useWhiteElements: useWhiteElements, shadowsEnabled: shadowsEnabled }
        };
        const filename = (sceneData.metadata.projectTitle || "simulation_mur_3d").replace(/[^a-z0-9]/gi, '_').toLowerCase() + ".json";
        const blob = new Blob([JSON.stringify(sceneData, null, 2)], { type: 'application/json' });
        const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = filename;
        document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(link.href);
    }
    async function handleExportPDF() {
        if (typeof jsPDF === 'undefined' && typeof window.jspdf.jsPDF === 'undefined') { alert("jsPDF non chargée."); return; }
        const { jsPDF: JSPDF_LIB } = window.jspdf; if (!JSPDF_LIB) { alert("Erreur jsPDF."); return; }
        const pdf = new JSPDF_LIB({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const pdfTitle = domElements.projectTitleInput ? domElements.projectTitleInput.value : ''; 
        const designer = (domElements.designerNameInput ? domElements.designerNameInput.value : '') || "N/A"; 
        const date = new Date().toLocaleDateString('fr-FR');
        const originalSceneBackground = scene.background.clone(); 
        const planeOriginalVisibility = plane.visible;

        const camState = { pos: camera.position.clone(), rot: camera.rotation.clone(), fov: camera.fov, aspect: camera.aspect, near: camera.near, far: camera.far, zoom: camera.zoom, target: controls.target.clone() };
        ['GridHelper', 'DirectionalLightHelper', 'CameraHelper'].forEach(n => { const o = scene.getObjectByName(n); if(o) o.visible = false; });
        const ghostVis = ghostElement ? ghostElement.visible : false; if (ghostElement) ghostElement.visible = false;
        const selObj = selectedObject; deselectObject(); renderer.setPixelRatio(window.devicePixelRatio * 1.5); 
        const views = [ 
            { name: "Perspective", isPerspective: true, pos: initialCameraPosition.toArray() }, 
            { name: "Vue de Face", isPerspective: false, up: [0,1,0], viewDir: new THREE.Vector3(0,0,1) }, 
            { name: "Vue Arrière", isPerspective: false, up: [0,1,0], viewDir: new THREE.Vector3(0,0,-1) },
            { name: "Vue de Gauche", isPerspective: false, up: [0,1,0], viewDir: new THREE.Vector3(-1,0,0) },
            { name: "Vue de Droite", isPerspective: false, up: [0,1,0], viewDir: new THREE.Vector3(1,0,0) },
            { name: "Vue de Dessus", isPerspective: false, up: [0,0,-1], viewDir: new THREE.Vector3(0,1,0.001) } 
        ];

        const m=10, pw=pdf.internal.pageSize.getWidth(), ph=pdf.internal.pageSize.getHeight();
        const headerHeight = pdfTitle.trim() !== "" ? 30 : 20;
        const footerHeight = 15; 
        const usablePageHeight = ph - headerHeight - footerHeight;
        const imageAreaHeight = usablePageHeight / 2 - m/2 ; 
        const imageAreaWidth = pw - 2*m; 

        const iw = (imageAreaWidth - m) / 2; 
        const ih = imageAreaHeight;          

        let vc=0; 
        const visibleObjects = objects.filter(obj => obj.visible && obj.geometry && obj.userData && !obj.userData.isGhost);
        const boundingBox = new THREE.Box3();
        
        if (visibleObjects.length > 0) {
            visibleObjects.forEach(obj => {
                obj.updateMatrixWorld(); 
                const objectBox = new THREE.Box3().setFromObject(obj, true); 
                boundingBox.union(objectBox);
            });
        } else {
             boundingBox.set(new THREE.Vector3(-0.5,-0.5,-0.5), new THREE.Vector3(0.5,0.5,0.5)); 
        }

        const sceneSize = new THREE.Vector3();
        boundingBox.getSize(sceneSize);
        const sceneCenter = new THREE.Vector3();
        boundingBox.getCenter(sceneCenter);

        const initialObjectStates = new Map();
        objects.forEach(obj => {
            if (obj.isMesh && obj.material) {
                const mat = obj.material;
                initialObjectStates.set(obj.uuid, {
                    userDataOriginalColor: obj.userData.originalColor,
                    appliedTextureUrl: obj.userData.appliedTextureUrl,
                    materialColor: mat.color.getHex(),
                    materialMap: mat.map 
                });
                const edges = obj.getObjectByName("elementEdges");
                if (edges) {
                    initialObjectStates.set(edges.uuid, {type: 'edges', visible: edges.visible});
                }
            }
        });
        if(plane){ 
            initialObjectStates.set(plane.uuid, {type: 'plane', visible: plane.visible});
        }

        function restoreAllToInitialStateForPDF() {
            initialObjectStates.forEach((state, uuid) => {
                const obj = scene.getObjectByProperty('uuid', uuid);
                if (obj) {
                    if (state.type === 'edges') {
                        obj.visible = state.visible;
                    } else if (state.type === 'plane') {
                        obj.visible = state.visible;
                    } else if (obj.isMesh && obj.material) {
                        obj.userData.originalColor = state.userDataOriginalColor;
                        obj.userData.appliedTextureUrl = state.appliedTextureUrl;
                        obj.material.color.setHex(state.materialColor);
                        obj.material.map = state.materialMap;
                        obj.material.needsUpdate = true;
                    }
                }
            });
            scene.background.copy(originalSceneBackground);
        }


        for (let i=0; i<views.length; i++) { 
            if (vc%2===0&&vc>0)pdf.addPage(); 
            if(vc%2===0){
                pdf.setFontSize(10);
                if (pdfTitle.trim() !== "") {
                    pdf.setFontSize(18);
                    pdf.setFont(undefined, 'bold');
                    const titleWidth = pdf.getStringUnitWidth(pdfTitle) * pdf.getFontSize() / pdf.internal.scaleFactor;
                    pdf.text(pdfTitle, (pw - titleWidth) / 2, m + 5);
                    pdf.setFont(undefined, 'normal');
                    pdf.setFontSize(10);
                    pdf.text(`Dessinateur: ${designer}`, m, m + 12);
                    pdf.text(`Date: ${date}`, m, m + 17);
                } else {
                    pdf.text(`Dessinateur: ${designer}`, m, m + 5);
                    pdf.text(`Date: ${date}`, m, m + 10);
                }
                pdf.text(`Page ${Math.floor(vc/2)+1}`, pw - m -15, m + 5);
                const watermarkEl = document.getElementById('watermark'); // Watermark might not be in domElements
                if (watermarkEl) pdf.text(watermarkEl.textContent, m, ph - 5, { align: 'left' });
            } 
            
            const view=views[i];
            let tempCamera;
            
            restoreAllToInitialStateForPDF(); 

            // For PDF export, always use colors, no textures, no white elements override
            objects.forEach(obj => {
                if (obj.isMesh && obj.material) {
                    obj.material.map = null; // Remove texture
                    obj.material.color.setHex(obj.userData.originalColor || elementColors.default); // Use original color
                    obj.material.needsUpdate = true;
                    const edges = obj.getObjectByName("elementEdges");
                    if (edges) edges.visible = true; // Ensure edges are visible
                }
            });
            scene.background.setHex(0xffffff); // White background for PDF
            if(plane) plane.visible = false; // Hide ground plane for PDF views


            if (view.isPerspective) {
                tempCamera = camera; 
                const sphere = new THREE.Sphere();
                boundingBox.getBoundingSphere(sphere);
                const distanceFactor = 1.8; 
                const safeRadius = Math.max(sphere.radius, 0.1); 
                tempCamera.position.copy(sphere.center).add(new THREE.Vector3(1, 1, 1).normalize().multiplyScalar(safeRadius * distanceFactor));
                tempCamera.lookAt(sphere.center);
                tempCamera.updateProjectionMatrix();
                controls.target.copy(sphere.center);
                controls.update();
            } else {
                tempCamera = new THREE.OrthographicCamera();
                const camSizeFactor = 1.1;
                const aspect = iw / ih;
                let camWidth = Math.max(sceneSize.x, sceneSize.z * aspect, 0.1) * camSizeFactor;
                let camHeight = camWidth / aspect;

                if (view.name === "Vue de Dessus") {
                    camWidth = Math.max(sceneSize.x, sceneSize.z, 0.1) * camSizeFactor;
                    camHeight = camWidth / aspect; 
                } else if (view.name === "Vue de Face" || view.name === "Vue Arrière") {
                    camWidth = Math.max(sceneSize.x, sceneSize.y / aspect, 0.1) * camSizeFactor;
                    camHeight = camWidth / aspect;
                } else { // Left or Right
                    camWidth = Math.max(sceneSize.z, sceneSize.y / aspect, 0.1) * camSizeFactor;
                    camHeight = camWidth / aspect;
                }
                
                tempCamera.left = -camWidth / 2;
                tempCamera.right = camWidth / 2;
                tempCamera.top = camHeight / 2;
                tempCamera.bottom = -camHeight / 2;
                tempCamera.near = 0.01;
                tempCamera.far = Math.max(sceneSize.length() * 2, 100);

                tempCamera.position.copy(sceneCenter).add(view.viewDir.clone().multiplyScalar(Math.max(sceneSize.length(), 1)));
                tempCamera.lookAt(sceneCenter);
                tempCamera.up.fromArray(view.up);
                tempCamera.updateProjectionMatrix();
            }
            
            renderer.render(scene, tempCamera);
            const imgData=renderer.domElement.toDataURL('image/png');
            const xP=m+(vc%2)*(iw+m);
            const yP=headerHeight;
            pdf.addImage(imgData,'PNG',xP,yP+8,iw,ih);
            
            let currentTextY = yP + 8 + ih + 5; 

            pdf.setFontSize(9);
            const viewTitleWidth = pdf.getStringUnitWidth(view.name) * pdf.getFontSize() / pdf.internal.scaleFactor;
            const viewTitleX = xP + (iw - viewTitleWidth) / 2;
            pdf.text(view.name, viewTitleX, currentTextY);
            pdf.setDrawColor(0); 
            pdf.line(viewTitleX, currentTextY + 0.5, viewTitleX + viewTitleWidth, currentTextY + 0.5); 
            currentTextY += 4; 

            if (!view.isPerspective) {
                const scaleText = `Échelle approx. 1:${Math.round(tempCamera.right * 2 * 1000 / iw)}`; // iw is in mm
                const scaleTextWidth = pdf.getStringUnitWidth(scaleText) * pdf.getFontSize() / pdf.internal.scaleFactor;
                pdf.text(scaleText, xP + (iw - scaleTextWidth) / 2, currentTextY);
            }
            vc++;
        }

        // Add new page for Metre, Mode Operatoire and Notes
        pdf.addPage();
        let summaryPageY = m + 5;
        if (pdfTitle.trim() !== "") {
            pdf.setFontSize(18);
            pdf.setFont(undefined, 'bold');
            const titleWidth = pdf.getStringUnitWidth(pdfTitle) * pdf.getFontSize() / pdf.internal.scaleFactor;
            pdf.text(pdfTitle, (pw - titleWidth) / 2, summaryPageY);
            summaryPageY += 10;
            pdf.setFont(undefined, 'normal');
        }
        pdf.setFontSize(10);
        if (designer.trim() !== "") {
            pdf.text(`Dessinateur: ${designer}`, m, summaryPageY);
            summaryPageY += 5;
        }
        pdf.text(`Date: ${date}`, m, summaryPageY);
        pdf.text(`Page ${Math.floor(vc / 2) + 1}`, pw - m - 15, m + 5);
        summaryPageY += 10;

        // Add "Mode opératoire" section
        const operatingModeText = domElements.operatingModeInput ? domElements.operatingModeInput.value : '';
        if (operatingModeText.trim() !== "") {
            if (summaryPageY > ph - 30 - (pdf.splitTextToSize(operatingModeText, pw - 2 * m).length * 4)) {
                pdf.addPage();
                summaryPageY = m + 10;
                pdf.text(`Page ${pdf.internal.getNumberOfPages()}`, pw - m - 15, m + 5);
            }
            pdf.setFontSize(14);
            pdf.setFont(undefined, 'bold');
            pdf.text("Mode opératoire", m, summaryPageY);
            summaryPageY += 7;
            pdf.setFontSize(10);
            pdf.setFont(undefined, 'normal');
            const splitOperatingMode = pdf.splitTextToSize(operatingModeText, pw - 2 * m);
            pdf.text(splitOperatingMode, m, summaryPageY);
            summaryPageY += (splitOperatingMode.length * 4) + 5;
        }

        // Add "Notes" section directly below "Mode opératoire"
        const notesText = domElements.projectNotesInput ? domElements.projectNotesInput.value : '';
        if (notesText.trim() !== "") {
            if (summaryPageY > ph - 30 - (pdf.splitTextToSize(notesText, pw - 2 * m).length * 4)) {
                pdf.addPage();
                summaryPageY = m + 10;
                pdf.text(`Page ${pdf.internal.getNumberOfPages()}`, pw - m - 15, m + 5);
            }
            pdf.setFontSize(14);
            pdf.setFont(undefined, 'bold');
            pdf.text("Notes", m, summaryPageY);
            summaryPageY += 7;
            pdf.setFontSize(10);
            pdf.setFont(undefined, 'normal');
            const splitNotes = pdf.splitTextToSize(notesText, pw - 2 * m);
            pdf.text(splitNotes, m, summaryPageY);
        }

        // Restore original materials and scene state
        restoreAllToInitialStateForPDF();
        
        camera.position.copy(camState.pos);camera.rotation.copy(camState.rot);camera.fov=camState.fov;camera.aspect=camState.aspect;camera.near=camState.near;camera.far=camState.far;camera.zoom=camState.zoom;controls.target.copy(camState.target);camera.updateProjectionMatrix();controls.update();
        scene.background.copy(originalSceneBackground); 
        ['GridHelper', 'DirectionalLightHelper', 'CameraHelper'].forEach(n => { const o = scene.getObjectByName(n); if(o) o.visible = true; });
        if (ghostElement && ghostVis) ghostElement.visible = true; if (selObj) selectObject(selObj); renderer.setPixelRatio(window.devicePixelRatio); 
        pdf.save((pdfTitle.trim() !== "" ? pdfTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() : "simulation_mur_3d") + "_vues.pdf");
    }
    function handleEditSelection() {
        if (!selectedObject) { alert("Aucun élément sélectionné."); return; }
        domElements.elementTypeSelector.value = selectedObject.userData.type; 
        domElements.elementTypeSelector.dispatchEvent(new Event('change')); 

        if (selectedObject.userData.baseType === 'brique') {
            domElements.brickCutContainer.style.display = 'inline-flex';
            domElements.brickCutSelector.value = selectedObject.userData.cutLength || '1/1';
            if (selectedObject.userData.cutLength === 'custom_cut' && selectedObject.userData.customCutWidthValue !== undefined) {
                domElements.brickCustomCutLengthInput.value = selectedObject.userData.customCutWidthValue * 100;
                domElements.brickCustomCutLengthContainer.style.display = 'inline-flex';
            } else if (selectedObject.userData.cutLength) {
                domElements.brickCustomCutLengthContainer.style.display = 'none';
            }
        } else if (selectedObject.userData.baseType === 'bloc') {
            domElements.blockCutContainer.style.display = 'inline-flex';
            domElements.blockCutSelector.value = selectedObject.userData.cutLength || '1/1';
            if (selectedObject.userData.cutLength === 'custom_cut' && selectedObject.userData.customCutWidthValue !== undefined) {
                domElements.blockCustomCutLengthInput.value = selectedObject.userData.customCutWidthValue * 100;
                domElements.blockCustomCutLengthContainer.style.display = 'inline-flex';
            } else if (selectedObject.userData.cutLength) {
                domElements.blockCustomCutLengthContainer.style.display = 'none';
            }
        }
        
        if (selectedObject.userData.type === 'custom') { domElements.customNameInput.value = selectedObject.userData.name.replace(/ \((1\/1|3\/4|1\/2|1\/4|Ailette|Coupe 34|Coupe [0-9.]+cm)\)$/, ''); domElements.customWidthInput.value = selectedObject.userData.width; domElements.customHeightInput.value = selectedObject.userData.height; domElements.customDepthInput.value = selectedObject.userData.depth; } 
        else if (selectedObject.userData.type === 'vide') { domElements.videDepthInput.value = selectedObject.userData.depth * 100; }
        
        const oldPos = selectedObject.position.clone(), oldRotY = selectedObject.rotation.y, oldSeatIdx = selectedObject.userData.seatingIndex, origColor = selectedObject.userData.originalColor, origTextureUrl = selectedObject.userData.appliedTextureUrl; 
        const selId = selectedObject.userData.id; scene.remove(selectedObject); const idx = objects.findIndex(o => o.userData.id === selId); if (idx > -1) objects.splice(idx, 1); if (selectedObject.geometry) selectedObject.geometry.dispose(); if (selectedObject.material) selectedObject.material.dispose(); selectedObject.traverse(c => { if (c.isLineSegments && c.name === "elementEdges") { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); }}); selectedObject = null; 
        updateElementCounter(); // This will become updateElementCounterUI(objects)
        setCurrentTool('add'); 
        if (ghostElement) { const newProps = getElementProperties(); ghostElement.geometry.dispose(); ghostElement.geometry = new THREE.BoxGeometry(newProps.width, newProps.height, newProps.depth); ghostElement.userData = {...newProps, isGhost: true, seatingIndex: oldSeatIdx, originalColor: origColor, appliedTextureUrl: origTextureUrl}; ghostElement.position.copy(oldPos); ghostElement.rotation.y = oldRotY; currentSeatingIndex = oldSeatIdx; const cLevelY = seatingLevels[oldSeatIdx] ? seatingLevels[oldSeatIdx].y : 0; let yAdjust = cLevelY + newProps.height / 2; if(newProps.baseType === 'brique') yAdjust += getSanitizedJointValue('joint-distance'); else if(newProps.baseType === 'bloc' || newProps.baseType === 'bloc_cell') yAdjust += getSanitizedJointValue('block-joint-distance'); ghostElement.position.y = snapToGrid(yAdjust); ghostElement.visible = true; isGhostFixed = true; controls.enabled = true; controls.enableRotate = true; }
        updateHelpBar(currentTool, isGhostFixed, selectedObject, currentActiveColor, currentActiveTextureUrl); alert("Modifiez propriétés, ajustez avec le DPad, confirmez (OK/Entrée).");
    }
    function setElementStyle(isWhite) {
        useWhiteElements = isWhite;
        objects.forEach(obj => { 
            if (obj.material) {
                if (obj.userData.appliedTextureUrl) {
                    obj.material.color.setHex(0xffffff); 
                } else if (obj.userData.originalColor) { 
                    obj.material.color.set(useWhiteElements ? 0xffffff : obj.userData.originalColor);
                }
                obj.material.needsUpdate = true; 
            }
        });
        if (selectedObject) { const tempSel = selectedObject; deselectObject(); selectObject(tempSel); }
    }
    function toggleAllShadows() {
        shadowsEnabled = !shadowsEnabled; renderer.shadowMap.enabled = shadowsEnabled;
        scene.traverse(c => { if (c.isLight && c.castShadow !== undefined) c.castShadow = shadowsEnabled; if (c.isMesh && c !== plane && c !== ghostElement) { c.castShadow = shadowsEnabled && c.userData.baseType !== 'vide'; c.receiveShadow = shadowsEnabled && c.userData.baseType !== 'vide'; if (c.material) c.material.needsUpdate = true; }});
        if (plane.material) plane.material.needsUpdate = true; 
        if(domElements.toggleShadowsBtn) domElements.toggleShadowsBtn.textContent = shadowsEnabled ? "Désactiver Ombres" : "Activer Ombres";
    }
    function setView(viewType) {
        const dist=5, center=new THREE.Vector3(0,0.5,0); controls.enabled=true; controls.enableRotate=true; camera.fov=initialPerspectiveFOV; camera.up.set(0,1,0);
        switch(viewType) {
            case '3d': camera.position.copy(initialCameraPosition); controls.target.copy(initialCameraLookAt); break;
            case 'top': camera.position.set(center.x, center.y + dist, center.z + 0.01); controls.target.copy(center); camera.lookAt(center); controls.enableRotate = false; break;
            case 'front': camera.position.set(center.x, center.y, center.z + dist); controls.target.copy(center); camera.lookAt(center); controls.enableRotate = false; break;
            case 'back': camera.position.set(center.x, center.y, center.z - dist); controls.target.copy(center); camera.lookAt(center); controls.enableRotate = false; break;
            case 'left': camera.position.set(center.x - dist, center.y, center.z); controls.target.copy(center); camera.lookAt(center); controls.enableRotate = false; break;
            case 'right': camera.position.set(center.x + dist, center.y, center.z); controls.target.copy(center); camera.lookAt(center); controls.enableRotate = false; break;
        }
        camera.updateProjectionMatrix(); controls.update();
    }
    function animate() { 
        requestAnimationFrame(animate); 
        controls.update(); 
        if (domElements.heightTooltip.style.display === 'block' && ghostElement && isGhostFixed && (ghostElement.userData.baseType === 'brique' || ghostElement.userData.baseType === 'bloc') ) {
            uiUpdateTooltipPosition(ghostElement, camera, renderer);
        }
        renderer.render(scene, camera); 
    }
    function updateSeatingSelector() { /* Placeholder - to be implemented or moved if complex state needed */ }
    initThreeJS(); console.log("MurSimulate3D initialisé.");
    
    function updateElementCounter() {
        updateElementCounterUI(objects);
    }

    function setupDpadControlsInteractions() {
        const dpadControls = domElements.dpadControlsContainer; // Use cached element
        if (dpadControls) {
            ['touchstart', 'touchmove', 'touchend', 'touchcancel', 'pointerdown', 'pointerup'].forEach(evt =>
                dpadControls.addEventListener(evt, function(e) {
                    e.stopPropagation();
                    // e.preventDefault(); // Removing preventDefault from the container itself, only on buttons
                }, { passive: true }) // Set container to passive true if not preventing default
            );
            // Prevent default and stop propagation on button children specifically
            Array.from(dpadControls.querySelectorAll('button')).forEach(btn => {
                ['touchstart', 'pointerdown'].forEach(evt => // Only for start events to prevent double actions if click is also handled
                    btn.addEventListener(evt, function(e) {
                        e.stopPropagation();
                        e.preventDefault(); // Prevent default on buttons to stop unwanted browser actions like zoom/scroll on tap
                    }, { passive: false })
                );
                // Allow touchend/pointerup to propagate if needed, or handle similarly if issues arise
                 ['touchmove', 'touchend', 'touchcancel', 'pointerup'].forEach(evt =>
                    btn.addEventListener(evt, function(e) {
                        e.stopPropagation();
                    }) // Removed preventDefault for these on buttons unless specific issues arise
                );
            });
        }
    }

    // --- DPAD TEST MOBILE ---
    function createTestMobileDpad() {
        if (document.getElementById('dpad-test-mobile')) return;
        const dpad = document.createElement('div');
        dpad.id = 'dpad-test-mobile';

        // Ligne du haut : Monter, Haut, Rotation gauche
        const rowUp = document.createElement('div');
        rowUp.className = 'dpad-row';
        const btnLevelUp = document.createElement('button');
        btnLevelUp.innerHTML = '⇞';
        btnLevelUp.title = 'Monter';
        const btnUp = document.createElement('button');
        btnUp.innerHTML = '▲';
        btnUp.title = 'Haut';
        const btnRotLeft = document.createElement('button');
        btnRotLeft.innerHTML = '↺';
        btnRotLeft.title = 'Rotation gauche';
        rowUp.appendChild(btnLevelUp);
        rowUp.appendChild(btnUp);
        rowUp.appendChild(btnRotLeft);

        // Ligne du milieu : Gauche, OK (Check stylé), Droite
        const rowMid = document.createElement('div');
        rowMid.className = 'dpad-row';
        const btnLeft = document.createElement('button');
        btnLeft.innerHTML = '◀';
        btnLeft.title = 'Gauche';
        const btnOk = document.createElement('button');
        // Utilisation d'un SVG pour un check stylé
        btnOk.innerHTML = `<svg width="36" height="36" viewBox="0 0 36 36" style="vertical-align:middle;">
            <polyline points="10,19 16,25 26,13" style="fill:none;stroke:#2ecc40;stroke-width:5;stroke-linecap:round;stroke-linejoin:round"/>
        </svg>`;
        btnOk.title = 'Valider';
        const btnRight = document.createElement('button');
        btnRight.innerHTML = '▶';
        btnRight.title = 'Droite';
        rowMid.appendChild(btnLeft);
        rowMid.appendChild(btnOk);
        rowMid.appendChild(btnRight);

        // Ligne du bas : Descendre, Bas, Rotation droite
        const rowDown = document.createElement('div');
        rowDown.className = 'dpad-row';
        const btnLevelDown = document.createElement('button');
        btnLevelDown.innerHTML = '⇟';
        btnLevelDown.title = 'Descendre';
        const btnDown = document.createElement('button');
        btnDown.innerHTML = '▼';
        btnDown.title = 'Bas';
        const btnRotRight = document.createElement('button');
        btnRotRight.innerHTML = '↻';
        btnRotRight.title = 'Rotation droite';
        rowDown.appendChild(btnLevelDown);
        rowDown.appendChild(btnDown);
        rowDown.appendChild(btnRotRight);

        dpad.appendChild(rowUp);
        dpad.appendChild(rowMid);
        dpad.appendChild(rowDown);

        [
            [btnUp, () => moveGhostOrSelected('forward')],
            [btnDown, () => moveGhostOrSelected('backward')],
            [btnLeft, () => moveGhostOrSelected('left')],
            [btnRight, () => moveGhostOrSelected('right')],
            [btnOk, () => confirmPlacement()],
            [btnLevelUp, () => moveGhostOrSelected('up')],
            [btnLevelDown, () => moveGhostOrSelected('down')],
            [btnRotLeft, () => rotateGhostOrSelected('left')],
            [btnRotRight, () => rotateGhostOrSelected('right')]
        ].forEach(([btn, handler]) => {
            ['click', 'touchstart'].forEach(evt =>
                btn.addEventListener(evt, function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    handler();
                }, { passive: false })
            );
        });

        document.body.appendChild(dpad);
    }

    createTestMobileDpad();
});
