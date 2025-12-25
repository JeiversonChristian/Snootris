// pieces.js

import { COLORS } from './constants.js';

// Definição das formas (Matrizes)
// A ordem deve bater com as CORES em constants.js (1=T, 2=I, 3=S, 4=Z, 5=L, 6=O, 7=J)
const SHAPES = [
    [], // 0 Vazio
    [[0, 1, 0], [1, 1, 1], [0, 0, 0]], // 1: T
    [[0, 2, 0, 0], [0, 2, 0, 0], [0, 2, 0, 0], [0, 2, 0, 0]], // 2: I
    [[0, 3, 3], [3, 3, 0], [0, 0, 0]], // 3: S
    [[4, 4, 0], [0, 4, 4], [0, 0, 0]], // 4: Z
    [[0, 0, 5], [5, 5, 5], [0, 0, 0]], // 5: L
    [[6, 6], [6, 6]], // 6: O
    [[7, 0, 0], [7, 7, 7], [0, 0, 0]]  // 7: J
];

export class Piece {
    constructor(ctx) {
        this.ctx = ctx;
        this.spawn();
    }

    // Cria uma nova peça no topo
    spawn() {
        // 1. Escolhe um tipo aleatório entre 1 e 7
        this.typeId = this.randomizeTetrominoType(COLORS.length - 2); 
        this.shape = SHAPES[this.typeId];
        
        // 2. Define a cor padrão
        this.color = COLORS[this.typeId];
        
        // 3. Regra da PEÇA ROSA: 20% de chance de ser especial
        // O índice 8 em constants.js é a cor Rosa Especial
        this.isSpecial = false;
        if (Math.random() < 0.2) { 
            this.color = COLORS[8]; 
            this.isSpecial = true;
        }

        // 4. Posiciona no topo e centraliza
        this.x = 3; // Posição horizontal inicial
        this.y = 0; // Posição vertical inicial
    }

    // Desenha a peça na tela
    draw() {
        this.ctx.fillStyle = this.color;
        // Percorre a matriz da forma (shape)
        this.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                // Se o valor for > 0, desenha o bloco
                if (value > 0) {
                    // O desenho assume que o Canvas já está escalado (1un = 1bloco)
                    // Mas adicionamos uma borda pequena para efeito de bloco separado
                    this.ctx.fillRect(this.x + x, this.y + y, 1, 1);
                    
                    // Borda para dar destaque (efeito "celular")
                    this.ctx.lineWidth = 0.05;
                    this.ctx.strokeStyle = '#5c3a45'; // Cor marrom suave
                    this.ctx.strokeRect(this.x + x, this.y + y, 1, 1);
                }
            });
        });
    }

    // Movimenta a peça (recebe um objeto com x, y e shape novo)
    move(p) {
        this.x = p.x;
        this.y = p.y;
        this.shape = p.shape;
    }

    // Método especial para quando o Snoopy bate na peça
    // Ela deve virar outra aleatória imediatamente
    transform() {
        let newType = this.typeId;
        // Garante que muda para um tipo diferente do atual
        while (newType === this.typeId) {
            newType = this.randomizeTetrominoType(COLORS.length - 2);
        }
        this.typeId = newType;
        this.shape = SHAPES[this.typeId];
        this.color = COLORS[this.typeId];
        
        // Reseta o status de especial ao transformar (ou mantém, se preferir)
        this.isSpecial = false; 
    }

    randomizeTetrominoType(noOfTypes) {
        return Math.floor(Math.random() * noOfTypes) + 1;
    }
}