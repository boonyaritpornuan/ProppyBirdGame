class FlappyBird {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.gameOverElement = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');

        // Game settings
        this.gravity = 0.5;
        this.jumpForce = -8;
        this.pipeSpeed = 2;
        this.pipeGap = 150;
        this.pipeWidth = 60;
        this.pipeSpawnInterval = 2000;

        // Load assets
        this.birdImg = new Image();
        this.birdImg.src = '/static/assets/bird.svg';
        this.pipeImg = new Image();
        this.pipeImg.src = '/static/assets/pipe.svg';

        this.init();
    }

    init() {
        // Bird properties
        this.bird = {
            x: this.canvas.width / 4,
            y: this.canvas.height / 2,
            width: 40,
            height: 40,
            velocity: 0
        };

        // Game state
        this.pipes = [];
        this.score = 0;
        this.gameOver = false;
        this.started = false;

        // Event listeners
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (!this.started) {
                    this.started = true;
                    this.startGame();
                }
                this.jump();
            }
        });

        this.canvas.addEventListener('click', () => {
            if (!this.started) {
                this.started = true;
                this.startGame();
            }
            this.jump();
        });

        // Initial render
        this.render();
    }

    startGame() {
        this.gameOverElement.classList.add('d-none');
        this.spawnPipe();
        this.gameLoop();
        this.pipeSpawner = setInterval(() => this.spawnPipe(), this.pipeSpawnInterval);
    }

    jump() {
        if (this.gameOver) return;
        this.bird.velocity = this.jumpForce;
    }

    spawnPipe() {
        const gapPosition = Math.random() * (this.canvas.height - this.pipeGap - 100) + 50;
        this.pipes.push({
            x: this.canvas.width,
            gapY: gapPosition,
            passed: false
        });
    }

    checkCollision(pipe) {
        const birdRight = this.bird.x + this.bird.width;
        const birdLeft = this.bird.x;
        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + this.pipeWidth;
        
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
            if (this.bird.y < pipe.gapY || this.bird.y + this.bird.height > pipe.gapY + this.pipeGap) {
                return true;
            }
        }
        return false;
    }

    update() {
        if (this.gameOver) return;

        // Update bird
        this.bird.velocity += this.gravity;
        this.bird.y += this.bird.velocity;

        // Check boundaries
        if (this.bird.y < 0 || this.bird.y + this.bird.height > this.canvas.height) {
            this.endGame();
            return;
        }

        // Update pipes
        this.pipes.forEach((pipe, index) => {
            pipe.x -= this.pipeSpeed;

            // Check collision
            if (this.checkCollision(pipe)) {
                this.endGame();
                return;
            }

            // Score point
            if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
                pipe.passed = true;
                this.score++;
                this.scoreElement.textContent = `Score: ${this.score}`;
            }
        });

        // Remove off-screen pipes
        this.pipes = this.pipes.filter(pipe => pipe.x + this.pipeWidth > 0);
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw bird
        this.ctx.save();
        this.ctx.translate(this.bird.x + this.bird.width/2, this.bird.y + this.bird.height/2);
        this.ctx.rotate(this.bird.velocity * 0.1);
        this.ctx.drawImage(this.birdImg, -this.bird.width/2, -this.bird.height/2, this.bird.width, this.bird.height);
        this.ctx.restore();

        // Draw pipes
        this.pipes.forEach(pipe => {
            // Upper pipe
            this.ctx.drawImage(this.pipeImg, pipe.x, 0, this.pipeWidth, pipe.gapY);
            // Lower pipe
            this.ctx.drawImage(this.pipeImg, pipe.x, pipe.gapY + this.pipeGap, 
                             this.pipeWidth, this.canvas.height - (pipe.gapY + this.pipeGap));
        });

        // Draw start message
        if (!this.started) {
            this.ctx.fillStyle = 'white';
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Click or Press Space to Start', this.canvas.width/2, this.canvas.height/2);
        }
    }

    gameLoop() {
        if (this.gameOver) return;
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    endGame() {
        this.gameOver = true;
        clearInterval(this.pipeSpawner);
        this.finalScoreElement.textContent = this.score;
        this.gameOverElement.classList.remove('d-none');
    }
}

function restartGame() {
    window.game = new FlappyBird();
}

// Start the game when the page loads
window.onload = () => {
    window.game = new FlappyBird();
};
