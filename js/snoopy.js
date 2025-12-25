// snoopy.js

import { ROWS, COLS } from './constants.js';

export class Snoopy {
    constructor(ctx) {
        this.ctx = ctx;
        this.image = new Image();
        this.image.src = 'img/snoopy_walk.png';
        
        // Estado inicial
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.direction = 1; // 1 = Direita, -1 = Esquerda
        this.speed = 0.08;  // Velocidade do movimento (em blocos por frame)
        
        // Tamanho do Snoopy em "blocos" do jogo
        // Se 1 bloco = 30px, o Snoopy ocupará 2x2 blocos (aprox 60px)
        this.width = 2; 
        this.height = 2;

        // Temporizador para controlar quando ele aparece
        this.nextSpawnTime = Date.now() + 5000; // Começa a aparecer após 5 segundos
    }

    update() {
        // Se não está ativo, verifica se está na hora de aparecer
        if (!this.active) {
            if (Date.now() > this.nextSpawnTime) {
                this.spawn();
            }
            return;
        }

        // Movimenta o Snoopy
        this.x += this.speed * this.direction;

        // Verifica se saiu da tela para desativar
        if ((this.direction === 1 && this.x > COLS) || 
            (this.direction === -1 && this.x < -this.width)) {
            this.active = false;
            // Define o próximo passeio para daqui a 10 a 20 segundos
            this.nextSpawnTime = Date.now() + Math.random() * 10000 + 10000;
        }
    }

    spawn() {
        this.active = true;
        
        // Escolhe uma altura aleatória (evitando o topo e o fundo extremos)
        this.y = Math.floor(Math.random() * (ROWS - 5)) + 2;

        // 50% de chance de vir da esquerda ou da direita
        if (Math.random() > 0.5) {
            // Vai para a Direita
            this.direction = 1;
            this.x = -this.width; // Começa fora da tela na esquerda
        } else {
            // Vai para a Esquerda
            this.direction = -1;
            this.x = COLS; // Começa fora da tela na direita
        }
    }

    draw() {
        if (!this.active) return;

        this.ctx.save();
        
        // Se estiver indo para a esquerda, precisamos espelhar a imagem
        if (this.direction === -1) {
            this.ctx.scale(-1, 1);
            // Ao inverter o eixo X, a posição de desenho muda
            this.ctx.drawImage(this.image, -this.x - this.width, this.y, this.width, this.height);
        } else {
            this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }

        this.ctx.restore();
    }

    // Verifica colisão com a peça atual
    checkCollision(piece) {
        if (!this.active) return false;

        let hit = false;

        // Verifica cada bloco da peça
        piece.shape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (value > 0) {
                    // Posição do bloco da peça
                    let px = piece.x + dx;
                    let py = piece.y + dy;

                    // Colisão simples de Retângulo vs Retângulo (AABB)
                    // Snoopy (sx, sy, sw, sh) vs Bloco (px, py, 1, 1)
                    if (px < this.x + this.width &&
                        px + 1 > this.x &&
                        py < this.y + this.height &&
                        py + 1 > this.y) {
                        hit = true;
                    }
                }
            });
        });

        return hit;
    }
}