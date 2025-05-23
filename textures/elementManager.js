import * as CONFIG from './config.js';
import { domElements } from './uiUtils.js'; // For selectors like elementTypeSelector
import { scene, textureLoader, loadedTextures as threeLoadedTextures } from './threeSetup.js'; // For scene access and texture loading

// State to be managed by script.js or a dedicated state module, passed as arguments or accessed via getters
// let objects = [];
// let ghostElement = null;
// let selectedObject = null;
// let currentSeatingIndex;
// let seatingLevels;
// let useWhiteElements;
// let shadowsEnabled;
// let getSanitizedJointValue; // Function to be passed or imported

// Functions to be moved here:
// - getElementProperties(elementTypeSelector, customNameInput, customWidthInput, etc...)
// - createGhostElement(props) -> needs access to scene, snapToGrid, getSanitizedJointValue, seatingLevels, currentSeatingIndex
// - removeGhostElement(ghostElement, scene)
// - addElementAtPosition(position, rotationY, propsFromGhost, scene, objectsArray, useWhiteElements, shadowsEnabled, elementId = null, originalColorOverride = null)
// - selectObject(object, selectedObjectRef, controls, currentTool) -> selectedObjectRef to update the main selectedObject
// - deselectObject(selectedObjectRef, controls, currentTool)
// - snapToGrid(value)
// - getSnappedPosition(worldPosition, elementProps, seatingLevels, currentSeatingIndex, getSanitizedJointValue)
// - moveGhostOrSelected(target, direction, eventParam, snapGridSize, getSanitizedJointValue, seatingLevels, updateTargetSeatingCallback, showTooltipCallback)
// - rotateGhostOrSelected(target, direction, eventParam)
// - applyColorToObject(object, colorHex, useWhiteElements, pushActionToUndoStackCallback, addToUndo = true)
// - applyTextureToObject(object, textureUrl, textureLoader, loadedTexturesCache, pushActionToUndoStackCallback, addToUndo = true)
// - duplicateObject(sourceObject, objectsArray, addElementCallback, selectObjectCallback, setCurrentToolCallback, pushActionToUndoStackCallback)
// - deleteObject(target, scene, objectsArray, selectedObjectRef, deselectObjectCallback, updateElementCounterCallback, pushActionToUndoStackCallback)
// - handleEditSelection(selectedObject, elementTypeSelector, variousInputs, scene, objectsArray, etc...)
// - updateElementCounter(objectsArray, elementCounterTableBody)

// Example of how getElementProperties might look (simplified)
export function getElementProperties(ghostElementFromMain) { // Pass ghostElement if needed for texture
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
                if (isNaN(customCutWidthValue) || customCutWidthValue <= 0) customCutWidthValue = dims[0];
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
        // seatingIndex: currentSeatingIndex, // This state needs to be passed or managed
        cutLength: (baseType === 'brique' || baseType === 'bloc') ? cutLength : undefined,
        widthMultiplier: baseType === 'brique' && cutLength !== 'custom_cut' ? widthMultiplier : 1.0,
        customCutWidthValue: (baseType === 'brique' || baseType === 'bloc') && cutLength === 'custom_cut' ? customCutWidthValue : undefined,
        appliedTextureUrl: ghostElementFromMain && ghostElementFromMain.userData && ghostElementFromMain.userData.appliedTextureUrl ? ghostElementFromMain.userData.appliedTextureUrl : null
    };
}

export function snapToGrid(value) {
    return Math.round(value / CONFIG.snapGridSize) * CONFIG.snapGridSize;
}

// Add other function shells here, e.g.:
// export function createGhostElement(...) { /* ... */ }
// export function addElementAtPosition(...) { /* ... */ }
// ... etc.
