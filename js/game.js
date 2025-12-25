// game.js

import { Board } from './board.js';
import { Snoopy } from './snoopy.js';
import { Piece } from './pieces.js';

export class Game {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.board = new Board(this.ctx);
        this.snoopy = new Snoopy(this.ctx);
        this.requestId = null; 
        this.gameStatus = 'STOPPED'; 
        this.time = { start: 0, elapsed: 0, level: 1000 }; 
        this.score = 0;
        this.lines = 0;
        this.piece = null; 
    }

    play() {
        this.reset();
        this.createNewPiece();
        this.gameStatus = 'PLAYING';
        this.animate();
    }

    reset() {
        this.score = 0;
        this.lines = 0;
        this.time = { start: 0, elapsed: 0, level: 1000 };
        this.board.reset();
        this.updateScoreDisplay();
    }

    createNewPiece() {
        // MUDANÇA: Não passamos mais this.ctx aqui
        this.piece = new Piece();
    }

    animate(now = 0) {
        this.time.elapsed = now - this.time.start;

        if (this.time.elapsed > this.time.level) {
            this.time.start = now;
            this.drop();
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.board.draw();
        this.snoopy.draw();
        
        if (this.piece) {
            // MUDANÇA: Passamos this.ctx aqui agora
            this.piece.draw(this.ctx);
            
            this.snoopy.update();
            
            if (this.snoopy.checkCollision(this.piece)) {
                this.piece.transform();
            }
        }

        if (this.gameStatus === 'PLAYING') {
            this.requestId = requestAnimationFrame(this.animate.bind(this));
        }
    }

    drop() {
        let p = { ...this.piece, y: this.piece.y + 1 };
        
        if (this.board.valid(p)) {
            this.piece.move(p);
        } else {
            this.board.freeze(this.piece);
            
            const points = this.board.clearLines();
            if (points > 0) {
                this.addScore(points);
            }

            if (this.piece.y === 0) {
                this.gameOver();
                return;
            }

            this.createNewPiece();
        }
    }

    move(dir) {
        if (this.gameStatus !== 'PLAYING') return;

        let p = { ...this.piece, x: this.piece.x + dir };
        if (this.board.valid(p)) {
            this.piece.move(p);
        }
    }

    // CORREÇÃO CRÍTICA: Lógica de rotação manual (sem JSON)
    rotate() {
        if (this.gameStatus !== 'PLAYING') return;

        // Clone Manual seguro
        let p = {
            x: this.piece.x,
            y: this.piece.y,
            shape: JSON.parse(JSON.stringify(this.piece.shape)) // Só clonamos a matriz, que é seguro
        };
        
        // Algoritmo de rotação
        for (let y = 0; y < p.shape.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [p.shape[x][y], p.shape[y][x]] = [p.shape[y][x], p.shape[x][y]];
            }
        }
        p.shape.forEach(row => row.reverse());

        if (this.board.valid(p)) {
            this.piece.move(p);
        }
    }

    // Drop Rápido (Arrastar para baixo ou Botão Mobile)
    hardDrop() {
        if (this.gameStatus !== 'PLAYING') return;
        
        // Move para baixo até encontrar obstáculo
        while (this.board.valid({ ...this.piece, y: this.piece.y + 1 })) {
            this.piece.y += 1;
            // REMOVIDO: this.score += 2; (Não ganha mais pontos por acelerar)
        }
        // Força o travamento imediato
        this.drop();
        this.updateScoreDisplay();
    }

    addScore(points) {
        this.score += points;
        this.lines += 1; 
        this.updateScoreDisplay();
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
        
        const endScreen = document.getElementById('game-over-screen');
        const finalScore = document.getElementById('final-score');
        
        if (finalScore) finalScore.innerText = this.score;
        if (endScreen) endScreen.classList.remove('hidden');
    }
}