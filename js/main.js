// main.js

import { Game } from './game.js';
import { COLS, ROWS, BLOCK_SIZE, KEY } from './constants.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Elementos da UI (Botões e Telas)
const btnStart = document.getElementById('btn-start');
const btnRestart = document.getElementById('btn-restart');
const btnRotateDesktop = document.getElementById('btn-rotate-desktop');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const hud = document.getElementById('hud');

// --- CONFIGURAÇÃO INICIAL DO CANVAS ---

// O CSS define o tamanho visual da tela. 
// Aqui, definimos a resolução interna baseada na nossa grade.
canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

// Escalamos o contexto para que 1 unidade lógica = 30px (BLOCK_SIZE)
// Assim, quando desenhamos um retângulo de 1x1, ele aparece com 30x30 pixels.
ctx.scale(BLOCK_SIZE, BLOCK_SIZE);

// Inicializa o Objeto do Jogo
const game = new Game(ctx, canvas);


// --- EVENTOS DE BOTÕES (UI) ---

btnStart.addEventListener('click', () => {
    startScreen.classList.add('hidden'); // Esconde menu
    hud.classList.remove('hidden');      // Mostra placar
    game.play();                         // Começa o jogo
});

btnRestart.addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    game.play();
});

// Botão de girar (Aparece só no Desktop se configurado no CSS)
if (btnRotateDesktop) {
    btnRotateDesktop.addEventListener('click', () => {
        game.rotate();
    });
}


// --- CONTROLES DE TECLADO (COMPUTADOR) ---

document.addEventListener('keydown', event => {
    // Impede que as setas rolem a página do navegador
    if([32, 37, 38, 39, 40].indexOf(event.keyCode) > -1) {
        event.preventDefault();
    }

    if (game.gameStatus !== 'PLAYING') return;

    // Mapeamento das teclas (definidas em constants.js)
    if (event.keyCode === KEY.LEFT) {
        game.move(-1);
    } else if (event.keyCode === KEY.RIGHT) {
        game.move(1);
    } else if (event.keyCode === KEY.DOWN) {
        game.drop(); // Acelera a queda suavemente
    } else if (event.keyCode === KEY.UP) {
        game.rotate();
    } else if (event.keyCode === KEY.SPACE) {
        game.hardDrop(); // Cai instantaneamente
    }
});


// --- CONTROLES DE TOQUE (CELULAR) ---

let touchStartX = 0;
let touchStartY = 0;
let touchNowX = 0;
let touchNowY = 0;
let isDragging = false; // Para diferenciar um "toque" de um "arrasto"

// 1. Quando o dedo toca a tela
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Impede comportamento padrão do navegador
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isDragging = false;
}, { passive: false });

// 2. Quando o dedo se move na tela
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (game.gameStatus !== 'PLAYING') return;

    touchNowX = e.touches[0].clientX;
    touchNowY = e.touches[0].clientY;

    const deltaX = touchNowX - touchStartX;
    const deltaY = touchNowY - touchStartY;

    // SENSITIVIDADE LATERAL (Arrastar para os lados)
    // Se moveu o dedo mais de 30 pixels para o lado...
    if (Math.abs(deltaX) > 30) { 
        if (deltaX > 0) {
            game.move(1); // Move para Direita
        } else {
            game.move(-1); // Move para Esquerda
        }
        // Atualiza o ponto de referência para permitir arrasto contínuo
        touchStartX = touchNowX; 
        isDragging = true;
    }

    // SENSITIVIDADE VERTICAL (Arrastar para baixo - Hard Drop)
    // Se arrastou rápido para baixo (mais de 50px)
    if (deltaY > 50) {
        game.hardDrop();
        touchStartY = touchNowY; // Reseta para não disparar várias vezes
        isDragging = true;
    }

}, { passive: false });

// 3. Quando o dedo sai da tela
canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    
    // Se o dedo não se moveu muito (não foi arrasto), consideramos um CLIQUE
    // O clique na tela serve para GIRAR a peça
    if (!isDragging && game.gameStatus === 'PLAYING') {
        game.rotate();
    }
    
    isDragging = false;
});