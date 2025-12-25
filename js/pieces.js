// pieces.js

import { COLORS } from './constants.js';

const SHAPES = [
    [], 
    [[0, 1, 0], [1, 1, 1], [0, 0, 0]], 
    [[0, 2, 0, 0], [0, 2, 0, 0], [0, 2, 0, 0], [0, 2, 0, 0]], 
    [[0, 3, 3], [3, 3, 0], [0, 0, 0]], 
    [[4, 4, 0], [0, 4, 4], [0, 0, 0]], 
    [[0, 0, 5], [5, 5, 5], [0, 0, 0]], 
    [[6, 6], [6, 6]], 
    [[7, 0, 0], [7, 7, 7], [0, 0, 0]]
];

export class Piece {
    // REMOVIDO: constructor(ctx) -> agora não recebe nada
    constructor() {
        this.spawn();
    }

    spawn() {
        this.typeId = this.randomizeTetrominoType(COLORS.length - 2); 
        this.shape = SHAPES[this.typeId];
        this.color = COLORS[this.typeId];
        this.isSpecial = false;
        
        if (Math.random() < 0.2) { 
            this.color = COLORS[8]; 
            this.isSpecial = true;
        }

        this.x = 3; 
        this.y = 0; 
    }

    // MUDANÇA: Recebe ctx aqui agora
    draw(ctx) {
        ctx.fillStyle = this.color;
        this.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    ctx.fillRect(this.x + x, this.y + y, 1, 1);
                    ctx.lineWidth = 0.05;
                    ctx.strokeStyle = '#5c3a45'; 
                    ctx.strokeRect(this.x + x, this.y + y, 1, 1);
                }
            });
        });
    }

    move(p) {
        this.x = p.x;
        this.y = p.y;
        this.shape = p.shape;
    }

    transform() {
        let newType = this.typeId;
        while (newType === this.typeId) {
            newType = this.randomizeTetrominoType(COLORS.length - 2);
        }
        this.typeId = newType;
        this.shape = SHAPES[this.typeId];
        this.color = COLORS[this.typeId];
        this.isSpecial = false; 
    }

    randomizeTetrominoType(noOfTypes) {
        return Math.floor(Math.random() * noOfTypes) + 1;
    }
}