export const initialCameraPosition = new THREE.Vector3(0.5, 0.4, 0.8);
export const initialCameraLookAt = new THREE.Vector3(0, 0.3, 0);
export const snapGridSize = 0.01;
export const TAP_DURATION_THRESHOLD = 250; // Milliseconds
export const DRAG_MOVEMENT_THRESHOLD = 10; // Pixels

export const elementColors = {
    brique: 0xCC4B37, // Rouge brique
    bloc: 0xA0A0A0,   // Gris béton (pour blocs creux)
    bloc_cell: 0xE0E0E0, // Gris clair pour cellulaire
    bloc_cell_assise: 0xD0D0D0, // Gris un peu plus foncé pour assise cellulaire
    bloc_terre_cuite: 0xD2691E, // Couleur terre cuite (chocolate/sienna)
    linteau: 0x808080, // Gris foncé pour linteau
    isolant: 0xFFE4B5, // Moccasin (jaune-orangé clair) pour isolant
    profil: 0x696969,  // DimGray pour profil
    poteau: 0x707070,  // Gris plus foncé pour poteau (gardé au cas où, même si poteaux retirés de la liste)
    custom: 0x00BCD4,  // Cyan pour personnalisé
    vide: 0xADD8E6,    // Bleu clair pour vide (sera transparent)
    default: 0xBEBEBE // Gris par défaut
};

export const colorPalette = [
    { hex: 0xCC0000, name: "Rouge foncé" },
    { hex: 0xD2B48C, name: "Brun clair" },
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

// Configuration des éléments disponibles
export const elementTypes = {
    briques: [
        { key: 'brique_m50', name: 'Brique M50 (19x5x9 cm)', dims: [0.19, 0.05, 0.09] },
        { key: 'brique_m57', name: 'Brique M57 (19x5.7x9 cm)', dims: [0.19, 0.057, 0.09] },
        { key: 'brique_m65', name: 'Brique M65 (19x6.5x9 cm)', dims: [0.19, 0.065, 0.09] },
        { key: 'brique_m90', name: 'Brique M90 (19x9x9 cm)', dims: [0.19, 0.09, 0.09] },
        { key: 'brique_wf', name: 'Brique WF (21x5x10 cm)', dims: [0.21, 0.05, 0.10] },
        { key: 'brique_wfd', name: 'Brique WFD (21x6.5x10 cm)', dims: [0.21, 0.065, 0.10] }
    ],
    blocs: [
        { key: 'bloc_b9', name: 'Bloc creux B9 (39x19x9 cm)', dims: [0.39, 0.19, 0.09] },
        { key: 'bloc_b14', name: 'Bloc creux B14 (39x19x14 cm)', dims: [0.39, 0.19, 0.14] },
        { key: 'bloc_b19', name: 'Bloc creux B19 (39x19x19 cm)', dims: [0.39, 0.19, 0.19] },
        { key: 'bloc_b29', name: 'Bloc creux B29 (39x19x29 cm)', dims: [0.39, 0.19, 0.29] },
        { key: 'bloc_cell_60x25x5', name: 'Bloc béton cell.(60x25x5)', dims: [0.60, 0.25, 0.05] },
        { key: 'bloc_cell_60x25x7', name: 'Bloc béton cell.(60x25x7)', dims: [0.60, 0.25, 0.07] },
        { key: 'bloc_cell_60x25x10', name: 'Bloc béton cell.(60x25x10)', dims: [0.60, 0.25, 0.10] },
        { key: 'bloc_cell_60x25x15', name: 'Bloc béton cell.(60x25x15)', dims: [0.60, 0.25, 0.15] },
        { key: 'bloc_cell_60x25x17_5', name: 'Bloc béton cell.(60x25x17.5)', dims: [0.60, 0.25, 0.175] },
        { key: 'bloc_cell_60x25x20', name: 'Bloc béton cell.(60x25x20)', dims: [0.60, 0.25, 0.20] },
        { key: 'bloc_cell_60x25x24', name: 'Bloc béton cell.(60x25x24)', dims: [0.60, 0.25, 0.24] },
        { key: 'bloc_cell_60x25x30', name: 'Bloc béton cell.(60x25x30)', dims: [0.60, 0.25, 0.30] },
        { key: 'bloc_cell_60x25x36', name: 'Bloc béton cell.(60x25x36)', dims: [0.60, 0.25, 0.36] },
        { key: 'beton_cell_assise_60x20x9', name: 'Béton cell. Assise (60x20x9)', dims: [0.60, 0.20, 0.09] },
        { key: 'beton_cell_assise_60x20x14', name: 'Béton cell. Assise (60x20x14)', dims: [0.60, 0.20, 0.14] },
        { key: 'beton_cell_assise_60x20x19', name: 'Béton cell. Assise (60x20x19)', dims: [0.60, 0.20, 0.19] },
        { key: 'beton_cell_assise_60x25x9', name: 'Béton cell. Assise (60x25x9)', dims: [0.60, 0.25, 0.09] },
        { key: 'beton_cell_assise_60x25x14', name: 'Béton cell. Assise (60x25x14)', dims: [0.60, 0.25, 0.14] },
        { key: 'beton_cell_assise_60x25x19', name: 'Béton cell. Assise (60x25x19)', dims: [0.60, 0.25, 0.19] },
        { key: 'terre_cuite_50x25x10', name: 'Terre cuite (50x25x10)', dims: [0.50, 0.25, 0.10] },
        { key: 'terre_cuite_50x25x14', name: 'Terre cuite (50x25x14)', dims: [0.50, 0.25, 0.14] },
        { key: 'terre_cuite_50x25x19', name: 'Terre cuite (50x25x19)', dims: [0.50, 0.25, 0.19] }
    ],
    linteaux: [
        { key: 'linteau_l120', name: 'Linteau Béton L120 (120x19x14 cm)', dims: [1.20, 0.19, 0.14] },
        { key: 'linteau_l140', name: 'Linteau Béton L140 (140x19x14 cm)', dims: [1.40, 0.19, 0.14] },
        { key: 'linteau_l160', name: 'Linteau Béton L160 (160x19x14 cm)', dims: [1.60, 0.19, 0.14] },
        { key: 'linteau_l180', name: 'Linteau Béton L180 (180x19x14 cm)', dims: [1.80, 0.19, 0.14] },
        { key: 'linteau_l200', name: 'Linteau Béton L200 (200x19x14 cm)', dims: [2.00, 0.19, 0.14] }
    ],
    isolants: [
        { key: 'isolant_pur5', name: 'Isolant PUR5 (120x60x5 cm)', dims: [1.20, 0.60, 0.05] },
        { key: 'isolant_pur6', name: 'Isolant PUR6 (120x60x6 cm)', dims: [1.20, 0.60, 0.06] },
        { key: 'isolant_pur7', name: 'Isolant PUR7 (120x60x7 cm)', dims: [1.20, 0.60, 0.07] }
    ],
    autres: [
        { key: 'vide', name: 'Vide (40x19x1-5 cm)', dims: [0.40, 0.19, 0.01] },
        { key: 'profil', name: 'Profil (5x6.5x250 cm)', dims: [0.05, 0.065, 2.50] },
        { key: 'custom', name: 'Personnalisé', dims: [0.2, 0.1, 0.1] }
    ]
};
