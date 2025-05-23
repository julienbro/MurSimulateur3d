import * as CONFIG from './config.js';

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
    customTextureInput: null,
    customTextureFileNameDisplay: null,
    customTexturePaletteContainer: null,
    jointDistanceInput: null,
    blockJointDistanceInput: null,
    heightTooltip: null,
    toolButtons: {
        select: null, add: null, move: null, duplicate: null, rotate: null, delete: null
    },
    viewButtons: {
        "3d": null, top: null, front: null, back: null, left: null, right: null
    },
    dpad: {
        up: null, down: null, left: null, right: null, confirm: null,
        rotLeft: null, rotRight: null, levelUp: null, levelDown: null
    },
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
    redoBtn: null,
    undoActionLink: null,
    redoActionLink: null,
    projectTitleInput: null,
    designerNameInput: null,
    operatingModeInput: null,
    projectNotesInput: null,
    dpadControlsContainer: null,
    // Add any other elements that were directly selected in script.js
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
    domElements.customTextureInput = document.getElementById('custom-texture-file-input');
    domElements.customTextureFileNameDisplay = document.getElementById('custom-texture-file-name-display');
    domElements.customTexturePaletteContainer = document.getElementById('custom-texture-palette-container');
    domElements.jointDistanceInput = document.getElementById('joint-distance');
    domElements.blockJointDistanceInput = document.getElementById('block-joint-distance');
    domElements.heightTooltip = document.getElementById('height-tooltip');

    domElements.toolButtons.select = document.getElementById('select-tool');
    domElements.toolButtons.add = document.getElementById('add-tool');
    domElements.toolButtons.move = document.getElementById('move-tool');
    domElements.toolButtons.duplicate = document.getElementById('duplicate-tool');
    domElements.toolButtons.rotate = document.getElementById('rotate-tool');
    domElements.toolButtons.delete = document.getElementById('delete-tool');

    domElements.viewButtons["3d"] = document.getElementById('view-3d');
    domElements.viewButtons.top = document.getElementById('view-top');
    domElements.viewButtons.front = document.getElementById('view-front');
    domElements.viewButtons.back = document.getElementById('view-back');
    domElements.viewButtons.left = document.getElementById('view-left');
    domElements.viewButtons.right = document.getElementById('view-right');

    domElements.dpad.up = document.getElementById('dpad-up');
    domElements.dpad.down = document.getElementById('dpad-down');
    domElements.dpad.left = document.getElementById('dpad-left');
    domElements.dpad.right = document.getElementById('dpad-right');
    domElements.dpad.confirm = document.getElementById('dpad-confirm');
    domElements.dpad.rotLeft = document.getElementById('dpad-rot-left');
    domElements.dpad.rotRight = document.getElementById('dpad-rot-right');
    domElements.dpad.levelUp = document.getElementById('dpad-level-up');
    domElements.dpad.levelDown = document.getElementById('dpad-level-down');
    domElements.dpadControlsContainer = document.getElementById('dpad-controls');


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
    domElements.undoBtn = document.getElementById('undo-tool');
    domElements.redoBtn = document.getElementById('redo-tool');
    domElements.undoActionLink = document.getElementById('undo-action');
    domElements.redoActionLink = document.getElementById('redo-action');

    domElements.projectTitleInput = document.getElementById('project-title');
    domElements.designerNameInput = document.getElementById('designer-name');
    domElements.operatingModeInput = document.getElementById('operating-mode');
    domElements.projectNotesInput = document.getElementById('project-notes');
}

export function updateCursorStyle(currentTool, currentActiveColor, currentActiveTextureUrl) {
    if (!domElements.viewportContainer) return;
    domElements.viewportContainer.classList.remove('crosshair-cursor', 'default-cursor', 'move-cursor');
    if (currentTool === 'select' && currentActiveColor !== null) {
        domElements.viewportContainer.style.cursor = 'copy';
    } else if (currentTool === 'select' && currentActiveTextureUrl !== null) {
        domElements.viewportContainer.style.cursor = 'crosshair'; // Or a specific texture icon if available
    } else {
        domElements.viewportContainer.style.cursor = ''; // Reset to default CSS behavior
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
    if (!domElements.helpBar) return;
    let helpText = "Navigation: Clic Gauche/Droit + Glisser = Orbite | Clic Milieu + Glisser = Pan | Molette = Zoom.";
    if (currentActiveColor !== null && currentTool === 'select') {
        helpText = "Mode PEINTURE: Cliquez sur un élément pour appliquer la couleur. Désactivez la couleur (palette/Échap) pour sélectionner.";
    } else if (currentActiveTextureUrl !== null && currentTool === 'select') {
        helpText = "Mode TEXTURE: Cliquez sur un élément pour appliquer la texture. Désactivez la texture (palette/Échap) pour sélectionner.";
    } else {
        switch (currentTool) {
            case 'add':
                if (isGhostFixed) { // Removed ghostElement check as it's state managed by script.js
                    helpText = "Mode AJOUT: Ajustez avec le DPad, OK pour placer. Tapez/Cliquez ailleurs pour repositionner le fantôme.";
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
    if (!domElements.toolButtons) return;
    Object.values(domElements.toolButtons).forEach(btn => {
        if (btn) btn.classList.remove('tool-active');
    });
    if (domElements.toolButtons[currentTool]) {
        domElements.toolButtons[currentTool].classList.add('tool-active');
    }
}

export function updateTooltipPosition(targetElement, camera, renderer) {
    if (!targetElement || !domElements.heightTooltip || !camera || !renderer || domElements.heightTooltip.style.display === 'none') return;

    const position = new THREE.Vector3();
    targetElement.getWorldPosition(position);
    position.y += targetElement.userData.height / 2 + 0.05;

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

export function createColorPalette(onColorSelectCallback) {
    if (!domElements.colorPaletteContainer) return;
    const paletteDiv = document.createElement('div');
    paletteDiv.className = 'color-palette';
    CONFIG.colorPalette.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        const swatchInner = document.createElement('div');
        swatchInner.className = 'color-swatch-inner';
        swatchInner.style.backgroundColor = '#' + color.hex.toString(16).padStart(6, '0');
        swatch.appendChild(swatchInner);
        swatch.dataset.color = color.hex;
        swatch.title = color.name;
        swatch.addEventListener('click', (event) => {
            event.stopPropagation();
            onColorSelectCallback(parseInt(swatch.dataset.color), swatch);
        });
        paletteDiv.appendChild(swatch);
    });
    domElements.colorPaletteContainer.appendChild(paletteDiv);
}

export function createTexturePalette(onTextureSelectCallback, onCustomTextureAddedCallback) {
    if (!domElements.texturePaletteContainer || !domElements.customTextureInput || !domElements.customTextureFileNameDisplay || !domElements.customTexturePaletteContainer) return;
    
    const paletteDiv = document.createElement('div');
    paletteDiv.className = 'texture-palette';
    CONFIG.texturePaletteURLs.forEach(textureUrl => {
        const swatch = document.createElement('div');
        swatch.className = 'texture-swatch';
        swatch.style.backgroundImage = `url(${textureUrl})`;
        swatch.dataset.textureUrl = textureUrl;

        let textureName = '';
        try {
            const fileNameWithExtension = textureUrl.substring(textureUrl.lastIndexOf('/') + 1);
            textureName = fileNameWithExtension.substring(0, fileNameWithExtension.lastIndexOf('.'));
            if (textureName.endsWith('_1')) {
                textureName = textureName.substring(0, textureName.length - 2);
            }
            textureName = textureName.replace(/_/g, ' ');
        } catch (e) {
            console.warn("Impossible d'extraire le nom de la texture pour l'URL:", textureUrl);
            textureName = 'Texture';
        }
        swatch.title = textureName;

        swatch.addEventListener('click', (event) => {
            event.stopPropagation();
            onTextureSelectCallback(swatch.dataset.textureUrl, swatch, false); // false for isCustom
        });
        paletteDiv.appendChild(swatch);
    });
    domElements.texturePaletteContainer.appendChild(paletteDiv);

    if (domElements.customTextureInput) {
        domElements.customTextureInput.addEventListener('change', () => {
            const file = domElements.customTextureInput.files[0];
            if (!file) return;
            domElements.customTextureFileNameDisplay.textContent = file.name;
            const reader = new FileReader();
            reader.onload = (event) => {
                const textureUrl = event.target.result;
                const swatch = document.createElement('div');
                swatch.className = 'custom-texture-swatch';
                swatch.style.backgroundImage = `url(${textureUrl})`;
                swatch.dataset.textureUrl = textureUrl;
                swatch.title = file.name;

                swatch.addEventListener('click', (clickEvent) => {
                    clickEvent.stopPropagation();
                    onTextureSelectCallback(swatch.dataset.textureUrl, swatch, true); // true for isCustom
                });
                domElements.customTexturePaletteContainer.appendChild(swatch);
                if(onCustomTextureAddedCallback) {
                    onCustomTextureAddedCallback(textureUrl, swatch);
                }
            };
            reader.readAsDataURL(file);
        });
    }
}

export function updateUndoRedoButtonsUI(undoStackLength, redoStackLength) {
    if (domElements.undoBtn) domElements.undoBtn.disabled = undoStackLength === 0;
    if (domElements.redoBtn) domElements.redoBtn.disabled = redoStackLength === 0;
    if (domElements.undoActionLink) domElements.undoActionLink.style.color = undoStackLength === 0 ? '#A0A0A0' : '#333333';
    if (domElements.redoActionLink) domElements.redoActionLink.style.color = redoStackLength === 0 ? '#A0A0A0' : '#333333';
}

export function updateElementCounterUI(objects) {
    if (!domElements.elementCounterTableBody) return;

    const counts = {};
    objects.forEach(obj => {
        let countName = obj.userData.originalName || obj.userData.name || 'Inconnu';
        if ((obj.userData.baseType === 'brique' || obj.userData.baseType === 'bloc') && obj.userData.cutLength && obj.userData.cutLength !== '1/1') {
            if (obj.userData.cutLength === 'custom_cut' && obj.userData.customCutWidthValue) {
                countName += ` (Long. ${(obj.userData.customCutWidthValue * 100).toFixed(1)}cm)`;
            } else if (obj.userData.cutLength !== 'custom_cut' && domElements.brickCutSelector && domElements.blockCutSelector) {
                const selectorId = obj.userData.baseType === 'brique' ? 'brick-cut-selector' : 'block-cut-selector';
                const cutSelector = document.getElementById(selectorId);
                if (cutSelector) {
                    const selectedCutOption = Array.from(cutSelector.options).find(opt => opt.value === obj.userData.cutLength);
                    if (selectedCutOption && selectedCutOption.textContent) countName += ` (${selectedCutOption.textContent})`;
                }
            }
        }
        counts[countsName] = (counts[countsName] || 0) + 1;
    });

    domElements.elementCounterTableBody.innerHTML = '';

    if (Object.keys(counts).length === 0) {
        // Display a message when no elements are placed
        const row = domElements.elementCounterTableBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 2; // Span across both columns
        cell.textContent = "Aucun élément n'est placé.";
        cell.style.textAlign = "center"; // Center the message
        cell.style.fontStyle = "italic"; // Optional: Make the message italic
        cell.style.color = "#555"; // Optional: Add a subtle color
    } else {
        for (const name in counts) {
            const row = domElements.elementCounterTableBody.insertRow();
            row.insertCell().textContent = name;
            row.insertCell().textContent = counts[name];
        }
    }
}
// updateSeatingSelector will be more complex due to state (seatingLevels, currentSeatingIndex)
// It might be better to keep it in script.js or pass more state/callbacks.
// For now, let's assume it will be handled in script.js or a future state management module.
// export function updateSeatingSelectorUI(seatingLevels, currentSeatingIndex, onSeatingChangeCallback) { ... }
