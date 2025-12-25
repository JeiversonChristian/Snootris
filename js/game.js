// game.js

import { Board } from './board.js';
import { Snoopy } from './snoopy.js';
import { Piece } from './pieces.js';

export class Game {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
        
        // Inicializa as classes auxiliares
        this.board = new Board(this.ctx);
        this.snoopy = new Snoopy(this.ctx);
        
        // Estado do jogo
        this.requestId = null; // ID da animação para poder cancelar depois
        this.gameStatus = 'STOPPED'; // STOPPED, PLAYING, PAUSED, GAMEOVER
        
        // Configurações de tempo e pontuação
        this.time = { start: 0, elapsed: 0, level: 1000 }; // level 1000ms = 1 seg
        this.score = 0;
        this.lines = 0;
        
        this.piece = null; // A peça que está caindo
    }

    play() {
        this.reset();
        this.createNewPiece();
        this.animate();
        this.gameStatus = 'PLAYING';
    }

    reset() {
        this.score = 0;
        this.lines = 0;
        this.time = { start: 0, elapsed: 0, level: 1000 };
        this.board.reset();
        this.updateScoreDisplay();
    }

    createNewPiece() {
        this.piece = new Piece(this.ctx);
    }

    // O Loop Principal (roda aprox. 60 vezes por segundo)
    animate(now = 0) {
        // Atualiza o tempo
        this.time.elapsed = now - this.time.start;

        // Se passou tempo suficiente, a peça cai um bloco
        if (this.time.elapsed > this.time.level) {
            this.time.start = now;
            this.drop();
        }

        // Desenha tudo
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.board.draw();
        this.snoopy.draw();
        
        // Atualiza e desenha a peça
        if (this.piece) {
            this.piece.draw();
            
            // LÓGICA DO SNOOPY:
            // 1. Atualiza a posição dele
            this.snoopy.update();
            
            // 2. Verifica se ele bateu na peça
            if (this.snoopy.checkCollision(this.piece)) {
                // Se bateu, transforma a peça!
                this.piece.transform();
            }
        }

        // Chama o próximo quadro se o jogo estiver rodando
        if (this.gameStatus === 'PLAYING') {
            this.requestId = requestAnimationFrame(this.animate.bind(this));
        }
    }

    // Lógica de derrubar a peça
    drop() {
        // Tenta mover para baixo
        let p = { ...this.piece, y: this.piece.y + 1 };
        
        if (this.board.valid(p)) {
            // Se for válido, move
            this.piece.move(p);
        } else {
            // Se não, congela a peça lá
            this.board.freeze(this.piece);
            
            // Verifica se completou linhas
            const points = this.board.clearLines();
            if (points > 0) {
                this.addScore(points);
            }

            // Se a peça parou no topo (y=0), é Game Over
            if (this.piece.y === 0) {
                this.gameOver();
                return;
            }

            // Cria uma nova peça
            this.createNewPiece();
        }
    }

    // Movimentação lateral (Controlada pelo jogador)
    move(dir) {
        if (this.gameStatus !== 'PLAYING') return;

        let p = { ...this.piece, x: this.piece.x + dir };
        if (this.board.valid(p)) {
            this.piece.move(p);
        }
    }

    // Rotação (Controlada pelo jogador)
    rotate() {
        if (this.gameStatus !== 'PLAYING') return;

        // Clona a matriz da peça para testar a rotação
        let p = JSON.parse(JSON.stringify(this.piece));
        
        // Algoritmo de rotação de matriz
        for (let y = 0; y < p.shape.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [p.shape[x][y], p.shape[y][x]] = [p.shape[y][x], p.shape[x][y]];
            }
        }
        p.shape.forEach(row => row.reverse());

        // Se a rotação for válida, aplica
        if (this.board.valid(p)) {
            this.piece.move(p);
        }
    }

    // Drop Rápido (Arrastar para baixo)
    hardDrop() {
        if (this.gameStatus !== 'PLAYING') return;
        
        // Move para baixo até encontrar obstáculo
        while (this.board.valid({ ...this.piece, y: this.piece.y + 1 })) {
            this.piece.y += 1;
            this.score += 2; // Ganha pontinhos extras por agilizar
        }
        // Força o travamento imediato
        this.drop();
        this.updateScoreDisplay();
    }

    addScore(points) {
        this.score += points;
        this.lines += 1; // Simplificado: conta quantas vezes limpou algo
        this.updateScoreDisplay();

        // AUMENTO DE DIFICULDADE:
        // A cada 500 pontos, a velocidade aumenta (tempo diminui)
        // Limite mínimo de 100ms para não ficar impossível
        const newLevel = Math.max(100, 1000 - (Math.floor(this.score / 500) * 50));
        this.time.level = newLevel;
    }

    updateScoreDisplay() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) scoreElement.innerText = this.score;
    }

    gameOver() {
        this.gameStatus = 'GAMEOVER';
        cancelAnimationFrame(this.requestId);
        
        // Mostra a tela de fim de jogo definida no HTML
        const endScreen = document.getElementById('game-over-screen');
        const finalScore = document.getElementById('final-score');
        
        if (finalScore) finalScore.innerText = this.score;
        if (endScreen) endScreen.classList.remove('hidden');
    }
}