export const initialCameraPosition = new THREE.Vector3(0.5, 0.4, 0.8);
export const initialCameraLookAt = new THREE.Vector3(0, 0.3, 0);
export const snapGridSize = 0.01;
export const TAP_DURATION_THRESHOLD = 250; // Milliseconds
export const DRAG_MOVEMENT_THRESHOLD = 10; // Pixels

export const elementColors = { 
    brique: 0xCD5C5C,  
    bloc: 0x87CEEB,    
    linteau: 0x778899, 
    isolant: 0xFFE4B5, 
    vide: 0xADD8E6,    
    profil: 0xBDB76B,  
    custom: 0x98FB98,  
    default: 0xBEBEBE  
};

export const colorPalette = [
    0xCC0000, 0xD2B48C, 0x8B4513, 0x2F4F4F, 0x000000, 
    0xD3D3D3, 0xA9A9A9, 0x696969, 0xF5F5DC, 0xFFFFE0, 
    0x90EE90, 0xFFFFFF  
];

export const texturePaletteURLs = [
    'https://julienbro.github.io/MurSimulateur3d/textures/brique_brune_1.png',
    'https://julienbro.github.io/MurSimulateur3d/textures/brique_rouge_1.png',
    'https://julienbro.github.io/MurSimulateur3d/textures/brique_claire_1.png',
    'https://julienbro.github.io/MurSimulateur3d/textures/brique_beige_1.png',
    'https://julienbro.github.io/MurSimulateur3d/textures/brique_grise_1.png',
    'https://julienbro.github.io/MurSimulateur3d/textures/brique_grise_2.png',
    'https://julienbro.github.io/MurSimulateur3d/textures/beton_1.png',
    'https://julienbro.github.io/MurSimulateur3d/textures/bois_pin_1.png',
    'https://julienbro.github.io/MurSimulateur3d/textures/fer_rouille_1.png'
];
