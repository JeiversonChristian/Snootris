// board.js

import { ROWS, COLS, COLORS, POINTS } from './constants.js';

export class Board {
    constructor(ctx) {
        this.ctx = ctx;
        this.grid = this.getEmptyBoard();
    }

    // Cria a matriz vazia (cheia de zeros)
    getEmptyBoard() {
        return Array.from(
            { length: ROWS }, () => Array(COLS).fill(0)
        );
    }

    // Reinicia o tabuleiro
    reset() {
        this.grid = this.getEmptyBoard();
    }

    // Verifica se a peça está numa posição válida
    // Retorna false se bater na parede ou em outra peça
    valid(p) {
        return p.shape.every((row, dy) => {
            return row.every((value, dx) => {
                let x = p.x + dx;
                let y = p.y + dy;
                return (
                    value === 0 ||
                    (this.insideWalls(x) && this.aboveFloor(y) && this.notOccupied(x, y))
                );
            });
        });
    }

    insideWalls(x) {
        return x >= 0 && x < COLS;
    }

    aboveFloor(y) {
        return y <= ROWS;
    }

    notOccupied(x, y) {
        return this.grid[y] && this.grid[y][x] === 0;
    }

    // "Congela" a peça no tabuleiro quando ela não pode mais descer
    freeze(p) {
        p.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    // LÓGICA DA PEÇA ROSA:
                    // Se a peça for especial, gravamos o ID 8 na grade.
                    // Se for normal, gravamos o ID do tipo da peça (1 a 7).
                    // (Lembre-se: COLORS[8] é a cor rosa especial em constants.js)
                    this.grid[y + p.y][x + p.x] = p.isSpecial ? 8 : value;
                }
            });
        });
    }

    // Desenha o tabuleiro (as peças que já caíram)
    draw() {
        this.grid.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    this.ctx.fillStyle = COLORS[value];
                    this.ctx.fillRect(x, y, 1, 1);
                    
                    // Borda igual à da peça
                    this.ctx.lineWidth = 0.05;
                    this.ctx.strokeStyle = '#5c3a45';
                    this.ctx.strokeRect(x, y, 1, 1);
                }
            });
        });
    }

    // Verifica e limpa as linhas completas
    clearLines() {
        let lines = 0;
        let pinkLines = 0;

        this.grid.forEach((row, y) => {
            // Se todos os valores da linha são maiores que 0, ela está cheia
            if (row.every(value => value > 0)) {
                lines++;

                // VERIFICAÇÃO DO BÔNUS:
                // Se todos os blocos da linha forem 8, é uma LINHA ROSA PURA!
                const isPinkRow = row.every(value => value === 8);
                if (isPinkRow) {
                    pinkLines++;
                }

                // Remove a linha e adiciona uma nova vazia no topo
                this.grid.splice(y, 1);
                this.grid.unshift(Array(COLS).fill(0));
            }
        });

        if (lines > 0) {
            // Retorna pontos normais + pontos bônus rosa
            return this.getLinesClearedPoints(lines, pinkLines);
        }
        return 0;
    }

    getLinesClearedPoints(lines, pinkLines) {
        // Pontuação base do Tetris clássico
        const linePoints =
            lines === 1 ? POINTS.SINGLE :
            lines === 2 ? POINTS.DOUBLE :
            lines === 3 ? POINTS.TRIPLE :
            lines === 4 ? POINTS.TETRIS :
            0;

        // Adiciona o bônus astronômico da linha rosa
        const bonusPoints = pinkLines * POINTS.PINK_BONUS;

        return linePoints + bonusPoints;
    }
}