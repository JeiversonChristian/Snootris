import { Game } from './game.js';
import { COLS, ROWS, BLOCK_SIZE, KEY } from './constants.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Elementos da UI
const btnStart = document.getElementById('btn-start');
const btnRestart = document.getElementById('btn-restart');
const btnRotateDesktop = document.getElementById('btn-rotate-desktop');
const btnDropMobile = document.getElementById('btn-drop-mobile'); // NOVO ELEMENTO
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const hud = document.getElementById('hud');

// Configuração do Canvas
canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;
ctx.scale(BLOCK_SIZE, BLOCK_SIZE);

const game = new Game(ctx, canvas);

// --- EVENTOS DE BOTÕES ---

btnStart.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    hud.classList.remove('hidden');
    game.play();
});

btnRestart.addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    game.play();
});

// Botão de Girar (Desktop)
if (btnRotateDesktop) {
    btnRotateDesktop.addEventListener('click', () => {
        game.rotate();
    });
}

// NOVO: Botão de Cair (Mobile)
// Usamos 'touchstart' para resposta imediata no celular
if (btnDropMobile) {
    btnDropMobile.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Evita zoom ou comportamento padrão
        game.hardDrop();
    }, { passive: false });
    
    // Fallback para click caso touchstart falhe ou seja testado no PC com emulador
    btnDropMobile.addEventListener('click', (e) => {
        game.hardDrop();
    });
}

// --- TECLADO (PC) ---
document.addEventListener('keydown', event => {
    if([32, 37, 38, 39, 40].indexOf(event.keyCode) > -1) {
        event.preventDefault();
    }

    if (game.gameStatus !== 'PLAYING') return;

    if (event.keyCode === KEY.LEFT) {
        game.move(-1);
    } else if (event.keyCode === KEY.RIGHT) {
        game.move(1);
    } else if (event.keyCode === KEY.DOWN) {
        game.drop();
    } else if (event.keyCode === KEY.UP) {
        game.rotate();
    } else if (event.keyCode === KEY.SPACE) {
        game.hardDrop();
    }
});

// --- TOUCH (CELULAR) ---
let touchStartX = 0;
let touchStartY = 0;
let isDragging = false;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isDragging = false;
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (game.gameStatus !== 'PLAYING') return;

    let touchNowX = e.touches[0].clientX;
    // let touchNowY = e.touches[0].clientY; // Não precisamos mais do Y para arrastar

    const deltaX = touchNowX - touchStartX;
    // const deltaY = touchNowY - touchStartY; // Removido controle vertical

    // SENSITIVIDADE LATERAL (Arrastar para os lados)
    if (Math.abs(deltaX) > 30) { 
        game.move(deltaX > 0 ? 1 : -1);
        touchStartX = touchNowX; 
        isDragging = true;
    }

    // REMOVIDO: Bloco que fazia o Hard Drop ao arrastar para baixo
    // Isso evita o problema das peças caírem rápido demais

}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    
    // Se foi apenas um toque rápido (não arrastou), GIRA a peça
    if (!isDragging && game.gameStatus === 'PLAYING') {
        game.rotate();
    }
    isDragging = false;
});