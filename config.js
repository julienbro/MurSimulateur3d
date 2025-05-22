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
    { hex: 0xCC0000, name: "Rouge foncé" },
    { hex: 0xD2B48C, name: "Fauve (Tan)" },
    { hex: 0x8B4513, name: "Brun" },
    { hex: 0x2F4F4F, name: "Gris ardoise foncé" },
    { hex: 0x000000, name: "Noir" },
    { hex: 0xD3D3D3, name: "Gris clair" },
    { hex: 0xA9A9A9, name: "Gris foncé" },
    { hex: 0x696969, name: "Gris terne" },
    { hex: 0xF5F5DC, name: "Beige" },
    { hex: 0xFFFFE0, name: "Jaune clair" },
    { hex: 0x90EE90, name: "Vert clair" },
    { hex: 0xFFFFFF, name: "Blanc" }
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
