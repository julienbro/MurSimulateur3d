import * as CONFIG from './config.js';
// Functions to be moved here:
// - DOM element selections (export them or provide getters)
// - updateCursorStyle(currentTool, currentActiveColor, currentActiveTextureUrl, viewportContainer)
// - updateHelpBar(helpBarElement, currentTool, isGhostFixed, selectedObject, currentActiveColor, currentActiveTextureUrl)
// - updateActiveToolButton(toolButtons, currentTool)
// - createColorPalette(colorPaletteContainer, onColorSelectCallback) -> onColorSelectCallback will update state in script.js
// - createTexturePalette(texturePaletteContainer, onTextureSelectCallback) -> onTextureSelectCallback will update state in script.js
// - updateTooltipPosition(tooltipElement, targetElement, camera, renderer)
// - showAndPositionTooltip(tooltipElement, targetElement, text, camera, renderer)
// - hideHeightTooltip(tooltipElement)
// - updateSeatingSelector() // This might need access to seatingLevels state

// Example structure:
export const domElements = {
    canvasContainer: null,
    viewportContainer: null,
    elementTypeSelector: null,
    brickCutContainer: null,
    brickCutSelector: null,
    brickCustomCutLengthContainer: null,
    brickCustomCutLengthInput: null,
    blockCutContainer: null,
    blockCutSelector: null,
    blockCustomCutLengthContainer: null,
    blockCustomCutLengthInput: null,
    customDimsContainer: null,
    customNameInput: null,
    customWidthInput: null,
    customHeightInput: null,
    customDepthInput: null,
    videDepthContainer: null,
    videDepthInput: null,
    helpBar: null,
    colorPaletteContainer: null,
    texturePaletteContainer: null,
    jointDistanceInput: null,
    blockJointDistanceInput: null,
    heightTooltip: null,
    toolButtons: {},
    viewButtons: {},
    dpad: {},
    elementCounterTableBody: null,
    leftSidebar: null,
    rightSidebar: null,
    newFileBtn: null,
    openFileBtn: null,
    saveFileBtn: null,
    exportPdfBtn: null,
    exportPrintButton: null,
    editSelectionBtn: null,
    styleWhiteBtn: null,
    styleColorBtn: null,
    toggleShadowsBtn: null,
    aboutAppBtn: null,
    helpGuideBtn: null,
    undoBtn: null,
    redoBtn: null
};

export function cacheDomElements() {
    domElements.canvasContainer = document.getElementById('threejs-canvas');
    domElements.viewportContainer = document.getElementById('viewport-container');
    domElements.elementTypeSelector = document.getElementById('element-type-selector');
    domElements.brickCutContainer = document.getElementById('brick-cut-container');
    domElements.brickCutSelector = document.getElementById('brick-cut-selector');
    domElements.brickCustomCutLengthContainer = document.getElementById('brick-custom-cut-length-container');
    domElements.brickCustomCutLengthInput = document.getElementById('brick-custom-cut-length');
    domElements.blockCutContainer = document.getElementById('block-cut-container');
    domElements.blockCutSelector = document.getElementById('block-cut-selector');
    domElements.blockCustomCutLengthContainer = document.getElementById('block-custom-cut-length-container');
    domElements.blockCustomCutLengthInput = document.getElementById('block-custom-cut-length');
    domElements.customDimsContainer = document.getElementById('custom-dims-container');
    domElements.customNameInput = document.getElementById('custom-name');
    domElements.customWidthInput = document.getElementById('custom-width');
    domElements.customHeightInput = document.getElementById('custom-height');
    domElements.customDepthInput = document.getElementById('custom-depth');
    domElements.videDepthContainer = document.getElementById('vide-depth-container');
    domElements.videDepthInput = document.getElementById('vide-depth');
    domElements.helpBar = document.getElementById('help-bar');
    domElements.colorPaletteContainer = document.getElementById('color-palette-container');
    domElements.texturePaletteContainer = document.getElementById('texture-palette-container');
    domElements.jointDistanceInput = document.getElementById('joint-distance');
    domElements.blockJointDistanceInput = document.getElementById('block-joint-distance');
    domElements.heightTooltip = document.getElementById('height-tooltip');
    domElements.toolButtons = {
        select: document.getElementById('select-tool'),
        add: document.getElementById('add-tool'),
        move: document.getElementById('move-tool'),
        duplicate: document.getElementById('duplicate-tool'),
        rotate: document.getElementById('rotate-tool'),
        delete: document.getElementById('delete-tool')
    };
    domElements.viewButtons = {
        "3d": document.getElementById('view-3d'),
        top: document.getElementById('view-top'),
        front: document.getElementById('view-front'),
        back: document.getElementById('view-back'),
        left: document.getElementById('view-left'),
        right: document.getElementById('view-right'),
    };
    domElements.dpad = {
        up: document.getElementById('dpad-up'),
        down: document.getElementById('dpad-down'),
        left: document.getElementById('dpad-left'),
        right: document.getElementById('dpad-right'),
        confirm: document.getElementById('dpad-confirm'),
        rotLeft: document.getElementById('dpad-rot-left'),
        rotRight: document.getElementById('dpad-rot-right'),
        levelUp: document.getElementById('dpad-level-up'),
        levelDown: document.getElementById('dpad-level-down')
    };
    domElements.elementCounterTableBody = document.getElementById('element-counter').getElementsByTagName('tbody')[0];
    domElements.leftSidebar = document.getElementById('left-sidebar');
    domElements.rightSidebar = document.getElementById('right-sidebar');
    domElements.newFileBtn = document.getElementById('new-file');
    domElements.openFileBtn = document.getElementById('open-file');
    domElements.saveFileBtn = document.getElementById('save-file');
    domElements.exportPdfBtn = document.getElementById('export-pdf');
    domElements.exportPrintButton = document.getElementById('export-print-button');
    domElements.editSelectionBtn = document.getElementById('edit-selection');
    domElements.styleWhiteBtn = document.getElementById('style-white');
    domElements.styleColorBtn = document.getElementById('style-color');
    domElements.toggleShadowsBtn = document.getElementById('toggle-shadows');
    domElements.aboutAppBtn = document.getElementById('about-app');
    domElements.helpGuideBtn = document.getElementById('help-guide');
    domElements.undoBtn = document.getElementById('undo-tool'); // Main menu undo
    domElements.redoBtn = document.getElementById('redo-tool'); // Main menu redo
}

export function updateCursorStyle(currentTool, currentActiveColor, currentActiveTextureUrl) {
    domElements.viewportContainer.classList.remove('crosshair-cursor', 'default-cursor', 'move-cursor');
    if (currentTool === 'select' && currentActiveColor !== null) {
        domElements.viewportContainer.style.cursor = 'copy';
    } else if (currentTool === 'select' && currentActiveTextureUrl !== null) {
        domElements.viewportContainer.style.cursor = 'crosshair';
    } else {
        domElements.viewportContainer.style.cursor = '';
        switch (currentTool) {
            case 'add':
            case 'select':
                domElements.viewportContainer.classList.add('crosshair-cursor');
                break;
            case 'move':
                domElements.viewportContainer.classList.add('move-cursor');
                break;
            default:
                domElements.viewportContainer.classList.add('default-cursor');
                break;
        }
    }
}

export function updateHelpBar(currentTool, isGhostFixed, selectedObject, currentActiveColor, currentActiveTextureUrl) {
    let helpText = "Navigation: Clic Gauche/Droit + Glisser = Orbite | Clic Milieu + Glisser = Pan | Molette = Zoom.";
    if (currentActiveColor !== null && currentTool === 'select') {
        helpText = "Mode PEINTURE: Cliquez sur un élément pour appliquer la couleur. Désactivez la couleur (palette/Échap) pour sélectionner.";
    } else if (currentActiveTextureUrl !== null && currentTool === 'select') {
        helpText = "Mode TEXTURE: Cliquez sur un élément pour appliquer la texture. Désactivez la texture (palette/Échap) pour sélectionner.";
    } else {
        switch (currentTool) {
            case 'add':
                if (isGhostFixed) {
                    helpText = "Mode AJOUT (Fantôme fixé): Utilisez le DPad pour ajuster, puis OK pour placer. Tapez ailleurs pour repositionner.";
                } else {
                    helpText = "Mode AJOUT: Tapez/Cliquez sur la scène pour positionner le fantôme.";
                }
                break;
            case 'select': helpText = "Mode SÉLECTION: Cliquez sur un élément pour le sélectionner. Choisissez une couleur/texture dans la palette pour appliquer."; break;
            case 'move': helpText = selectedObject ? "Mode DÉPLACER: Utilisez le DPad pour déplacer. Confirmez avec 'OK'." : "Mode DÉPLACER: Cliquez sur un élément pour le sélectionner."; break;
            case 'rotate': helpText = selectedObject ? "Mode PIVOTER: Utilisez le DPad (↺, ↻). Confirmez avec 'OK'." : "Mode PIVOTER: Cliquez sur un élément pour le sélectionner."; break;
            case 'duplicate': helpText = "Mode DUPLIQUER: Cliquez sur un élément pour le dupliquer."; break;
            case 'delete': helpText = "Mode SUPPRIMER: Cliquez sur un élément pour le supprimer."; break;
        }
    }
    domElements.helpBar.textContent = helpText;
}

export function updateActiveToolButton(currentTool) {
    Object.values(domElements.toolButtons).forEach(btn => btn.classList.remove('tool-active'));
    if (domElements.toolButtons[currentTool]) domElements.toolButtons[currentTool].classList.add('tool-active');
}

export function createColorPalette(onColorSelectCallback) {
    const paletteDiv = document.createElement('div');
    paletteDiv.className = 'color-palette';
    CONFIG.colorPalette.forEach(colorHex => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        const swatchInner = document.createElement('div');
        swatchInner.className = 'color-swatch-inner';
        swatchInner.style.backgroundColor = '#' + colorHex.toString(16).padStart(6, '0');
        swatch.appendChild(swatchInner);
        swatch.dataset.color = colorHex;
        swatch.addEventListener('click', (event) => {
            event.stopPropagation();
            onColorSelectCallback(swatch, parseInt(swatch.dataset.color));
        });
        paletteDiv.appendChild(swatch);
    });
    domElements.colorPaletteContainer.appendChild(paletteDiv);
}

export function createTexturePalette(onTextureSelectCallback) {
    const paletteDiv = document.createElement('div');
    paletteDiv.className = 'texture-palette';
    CONFIG.texturePaletteURLs.forEach(textureUrl => {
        const swatch = document.createElement('div');
        swatch.className = 'texture-swatch';
        swatch.style.backgroundImage = `url(${textureUrl})`;
        swatch.dataset.textureUrl = textureUrl;
        swatch.addEventListener('click', (event) => {
            event.stopPropagation();
            onTextureSelectCallback(swatch, swatch.dataset.textureUrl);
        });
        paletteDiv.appendChild(swatch);
    });
    domElements.texturePaletteContainer.appendChild(paletteDiv);
}

export function updateTooltipPosition(element, camera, renderer) {
    if (!element || !domElements.heightTooltip || !camera || !renderer || domElements.heightTooltip.style.display === 'none') return;
    const position = new THREE.Vector3();
    element.getWorldPosition(position);
    position.y += element.userData.height / 2 + 0.05;
    const vector = position.project(camera);
    const x = (vector.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
    const y = (vector.y * -0.5 + 0.5) * renderer.domElement.clientHeight;
    domElements.heightTooltip.style.left = `${x}px`;
    domElements.heightTooltip.style.top = `${y}px`;
}

export function showAndPositionTooltip(targetElement, text, camera, renderer) {
    if (domElements.heightTooltip) {
        domElements.heightTooltip.textContent = text;
        domElements.heightTooltip.style.display = 'block';
        updateTooltipPosition(targetElement, camera, renderer);
    }
}

export function hideHeightTooltip() {
    if (domElements.heightTooltip) {
        domElements.heightTooltip.style.display = 'none';
    }
}

export function updateSeatingSelector() { /* Placeholder for now */ }
