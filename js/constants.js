// constants.js
// Configurações Globais do Snootris

// Cores das Peças (Padrão Tetris + Rosa Especial)
export const COLORS = [
    null,
    '#FF0D72', // T (Magenta/Roxo)
    '#0DC2FF', // I (Ciano)
    '#0DFF72', // S (Verde)
    '#F538FF', // Z (Rosa Choque - Vamos usar este ou definir um rosa específico)
    '#FF8E0D', // L (Laranja)
    '#FFE138', // O (Amarelo)
    '#3877FF', // J (Azul)
    '#FF69B4', // **PEÇA ROSA ESPECIAL** (HotPink)
];

// Configurações do Jogo
export const COLS = 10;
export const ROWS = 20;
export const BLOCK_SIZE = 30; // Tamanho base, será recalculado no resize

// Pontuação
export const POINTS = {
    SINGLE: 100,
    DOUBLE: 300,
    TRIPLE: 500,
    TETRIS: 800,
    PINK_BONUS: 2000 // Pontuação extra para linha só rosa
};

// Teclas
export const KEY = {
    LEFT: 37,
    RIGHT: 39,
    DOWN: 40,
    UP: 38, // Girar
    SPACE: 32 // Hard Drop (opcional)
};