class InfinitePuzzle {
    constructor(mode, options = {}) {
        this.mode = mode; // 'classic' or 'geometry'
        this.level = options.startLevel || 1;
        this.baseSeed = options.seed !== undefined ? options.seed : Math.floor(Math.random() * 1000000);
        this.moves = 0;
        this.gridSize = 3 + Math.floor((this.level - 1) / 3); // Adjust for start level
        this.pieceSize = 100;
        this.pieces = [];
        this.selectedPiece = null;
        this.currentImage = null;
        this.previousSolvedImage = null;
        this.draggedPieceId = null;

        this.container = document.getElementById('puzzle-container');
        this.previewCanvas = document.getElementById('preview-canvas');
        this.levelDisplay = document.getElementById('level');
        this.movesDisplay = document.getElementById('moves');
        this.messageDisplay = document.getElementById('message');

        this.init();
    }

    async init() {
        this.showMessage('');
        await this.generateImage();
        this.createPuzzle();
    }

    // Generate image based on mode
    async generateImage() {
        if (this.mode === 'classic') {
            await this.generateClassicImage();
        } else if (this.mode === 'space') {
            await this.generateSpaceImage();
        } else {
            await this.generateGeometryImage();
        }
    }

    // Classic mode: Dreamlike landscapes and fantasy art
    async generateClassicImage() {
        const canvas = document.createElement('canvas');
        const size = this.gridSize * this.pieceSize;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Determine scene type
        const sceneTypes = ['sunset', 'forest', 'ocean', 'mountains', 'dreamscape', 'aurora'];
        const sceneType = sceneTypes[(this.level - 1) % sceneTypes.length];

        // If we have a previous image, it becomes the background/sky
        // and the new scene is drawn as foreground on top
        if (this.previousSolvedImage) {
            // Draw previous image as the distant background (scaled up, centered)
            const scale = 1.5;
            const offsetX = (size - size * scale) / 2;
            const offsetY = (size - size * scale) / 2;
            ctx.drawImage(this.previousSolvedImage, offsetX, offsetY, size * scale, size * scale);

            // Draw scene foreground elements on top
            this.drawClassicSceneForeground(ctx, size, this.level, sceneType);
        } else {
            // First level - draw complete scene
            this.drawClassicScene(ctx, size, this.level, sceneType);
        }

        this.currentImage = canvas;
        this.updatePreview(canvas);
    }

    drawClassicScene(ctx, size, level, sceneType) {
        const seed = this.baseSeed + level * 12345;
        const random = this.seededRandom(seed);

        switch (sceneType) {
            case 'sunset':
                this.drawSunsetScene(ctx, size, random, level);
                break;
            case 'forest':
                this.drawForestScene(ctx, size, random, level);
                break;
            case 'ocean':
                this.drawOceanScene(ctx, size, random, level);
                break;
            case 'mountains':
                this.drawMountainScene(ctx, size, random, level);
                break;
            case 'dreamscape':
                this.drawDreamscape(ctx, size, random, level);
                break;
            case 'aurora':
                this.drawAuroraScene(ctx, size, random, level);
                break;
        }
    }

    // Draw only foreground elements - previous image shows through as sky/background
    drawClassicSceneForeground(ctx, size, level, sceneType) {
        const seed = this.baseSeed + level * 12345;
        const random = this.seededRandom(seed);

        switch (sceneType) {
            case 'sunset':
                this.drawSunsetForeground(ctx, size, random, level);
                break;
            case 'forest':
                this.drawForestForeground(ctx, size, random, level);
                break;
            case 'ocean':
                this.drawOceanForeground(ctx, size, random, level);
                break;
            case 'mountains':
                this.drawMountainForeground(ctx, size, random, level);
                break;
            case 'dreamscape':
                this.drawDreamscapeForeground(ctx, size, random, level);
                break;
            case 'aurora':
                this.drawAuroraForeground(ctx, size, random, level);
                break;
        }
    }

    // Foreground-only versions - sky/background comes from previous image

    drawSunsetForeground(ctx, size, random, level) {
        // Water in bottom portion - semi-transparent to show reflection of previous image
        const waterY = size * 0.6;
        const waterGradient = ctx.createLinearGradient(0, waterY, 0, size);
        waterGradient.addColorStop(0, 'rgba(255, 150, 100, 0.3)');
        waterGradient.addColorStop(0.5, 'rgba(50, 80, 120, 0.7)');
        waterGradient.addColorStop(1, 'rgba(20, 40, 60, 0.9)');
        ctx.fillStyle = waterGradient;
        ctx.fillRect(0, waterY, size, size - waterY);

        // Water ripples
        this.drawWaterRipples(ctx, size, waterY, random);

        // Silhouette elements (land, trees) - fully opaque
        this.drawSilhouettes(ctx, size, random);

        // Clouds - semi-transparent
        this.drawClouds(ctx, size, random, 'rgba(255, 200, 150, 0.4)');
    }

    drawForestForeground(ctx, size, random, level) {
        // Misty layers - gradient from transparent (top) to opaque (bottom)
        for (let layer = 0; layer < 4; layer++) {
            const y = size * (0.35 + layer * 0.12);
            const alpha = 0.4 + layer * 0.15;
            const hue = 120 + layer * 10 + level * 5;

            ctx.fillStyle = `hsla(${hue}, 30%, ${45 - layer * 8}%, ${alpha})`;

            ctx.beginPath();
            ctx.moveTo(0, y);
            for (let x = 0; x <= size; x += 20) {
                const noise = Math.sin(x * 0.02 + layer) * 25 + random() * 15;
                ctx.lineTo(x, y + noise);
            }
            ctx.lineTo(size, size);
            ctx.lineTo(0, size);
            ctx.closePath();
            ctx.fill();
        }

        // Trees - opaque
        const treeCount = 6 + Math.floor(random() * 4);
        for (let i = 0; i < treeCount; i++) {
            const x = random() * size;
            const height = size * (0.25 + random() * 0.35);
            const y = size - height * 0.25;
            this.drawTree(ctx, x, y, height, random);
        }

        // Foreground foliage - opaque
        this.drawForegroundFoliage(ctx, size, random);

        // Particles
        this.drawParticles(ctx, size, random, 'rgba(255, 255, 200, 0.8)');
    }

    drawOceanForeground(ctx, size, random, level) {
        // Ocean - semi-transparent at top, opaque at bottom
        const oceanY = size * 0.5;
        for (let y = oceanY; y < size; y += 4) {
            const progress = (y - oceanY) / (size - oceanY);
            const hue = 200 - progress * 20;
            const lightness = 45 - progress * 15;
            const alpha = 0.4 + progress * 0.5;
            ctx.fillStyle = `hsla(${hue}, 60%, ${lightness}%, ${alpha})`;

            ctx.beginPath();
            ctx.moveTo(0, y);
            for (let x = 0; x <= size; x += 10) {
                const wave = Math.sin(x * 0.03 + y * 0.02 + level) * (5 - progress * 3);
                ctx.lineTo(x, y + wave);
            }
            ctx.lineTo(size, size);
            ctx.lineTo(0, size);
            ctx.fill();
        }

        // Distant islands - semi-transparent
        for (let i = 0; i < 2; i++) {
            const x = size * 0.2 + random() * size * 0.6;
            const w = 30 + random() * 50;
            const h = 15 + random() * 30;
            ctx.fillStyle = `hsla(${220 + random() * 20}, 25%, 35%, 0.7)`;
            ctx.beginPath();
            ctx.ellipse(x, oceanY, w, h, 0, Math.PI, 0);
            ctx.fill();
        }

        // Light clouds
        this.drawClouds(ctx, size, random, 'rgba(255, 255, 255, 0.5)');
    }

    drawMountainForeground(ctx, size, random, level) {
        const timeOfDay = level % 3;

        // Mountain layers - gradient transparency
        for (let layer = 0; layer < 4; layer++) {
            const baseY = size * (0.3 + layer * 0.13);
            const alpha = 0.5 + layer * 0.15;
            const lightness = 25 + layer * 12;
            const color = `hsla(${230 + layer * 8}, ${25 + layer * 5}%, ${lightness}%, ${alpha})`;

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(0, size);

            let x = 0;
            while (x < size) {
                const peakHeight = (random() * 0.25 + 0.15) * size * (1 - layer * 0.12);
                const peakWidth = random() * 70 + 50;

                ctx.lineTo(x, baseY);
                ctx.lineTo(x + peakWidth / 2, baseY - peakHeight);
                ctx.lineTo(x + peakWidth, baseY);

                x += peakWidth;
            }
            ctx.lineTo(size, size);
            ctx.closePath();
            ctx.fill();
        }

        // Foreground ground - opaque
        ctx.fillStyle = '#1a2030';
        ctx.fillRect(0, size * 0.88, size, size * 0.12);
    }

    drawDreamscapeForeground(ctx, size, random, level) {
        // Vignette overlay - darkens edges, shows previous image in center
        const vignetteGradient = ctx.createRadialGradient(
            size/2, size/2, size * 0.2,
            size/2, size/2, size * 0.7
        );
        vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignetteGradient.addColorStop(0.5, 'rgba(40, 20, 60, 0.3)');
        vignetteGradient.addColorStop(1, 'rgba(20, 10, 40, 0.7)');
        ctx.fillStyle = vignetteGradient;
        ctx.fillRect(0, 0, size, size);

        // Floating islands in foreground
        for (let i = 0; i < 2 + random() * 2; i++) {
            const x = random() * size;
            const y = size * (0.6 + random() * 0.3);
            const islandSize = 25 + random() * 50;
            this.drawFloatingIsland(ctx, x, y, islandSize, random);
        }

        // Ethereal wisps
        for (let i = 0; i < 8; i++) {
            ctx.strokeStyle = `hsla(${280 + random() * 60}, 70%, 70%, ${0.15 + random() * 0.25})`;
            ctx.lineWidth = 2 + random() * 3;
            ctx.beginPath();
            const startX = random() * size;
            const startY = size * 0.5 + random() * size * 0.5;
            ctx.moveTo(startX, startY);
            for (let j = 0; j < 4; j++) {
                ctx.quadraticCurveTo(
                    startX + (random() - 0.5) * 80,
                    startY - j * 25 - random() * 15,
                    startX + (random() - 0.5) * 60,
                    startY - (j + 1) * 25
                );
            }
            ctx.stroke();
        }

        // Glowing particles
        this.drawParticles(ctx, size, random, `hsla(${50 + level * 20}, 100%, 80%, 0.8)`);
    }

    drawAuroraForeground(ctx, size, random, level) {
        // Aurora bands - semi-transparent
        for (let band = 0; band < 4; band++) {
            const hue = 120 + band * 35 + level * 10;
            ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.25)`;
            ctx.lineWidth = 15 + random() * 25;
            ctx.lineCap = 'round';

            ctx.beginPath();
            const startY = size * (0.15 + band * 0.1);
            ctx.moveTo(0, startY);

            for (let x = 0; x <= size; x += 30) {
                const y = startY + Math.sin(x * 0.02 + band + level) * 40 + random() * 15;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        // Snowy ground - opaque
        ctx.fillStyle = '#e0e8f0';
        ctx.beginPath();
        ctx.moveTo(0, size * 0.82);
        for (let x = 0; x <= size; x += 15) {
            ctx.lineTo(x, size * 0.82 + Math.sin(x * 0.05) * 8 + random() * 4);
        }
        ctx.lineTo(size, size);
        ctx.lineTo(0, size);
        ctx.fill();

        // Pine trees - opaque silhouettes
        for (let i = 0; i < 10; i++) {
            const x = i * size / 9 + random() * 25 - 12;
            const h = 35 + random() * 55;
            ctx.fillStyle = '#0a1520';
            ctx.beginPath();
            ctx.moveTo(x, size * 0.82);
            ctx.lineTo(x - h * 0.25, size * 0.82);
            ctx.lineTo(x, size * 0.82 - h);
            ctx.lineTo(x + h * 0.25, size * 0.82);
            ctx.closePath();
            ctx.fill();
        }
    }

    drawSunsetScene(ctx, size, random, level) {
        // Sky gradient
        const skyGradient = ctx.createLinearGradient(0, 0, 0, size);
        skyGradient.addColorStop(0, `hsl(${280 + level * 10}, 60%, 30%)`);
        skyGradient.addColorStop(0.3, `hsl(${20 + level * 5}, 80%, 50%)`);
        skyGradient.addColorStop(0.5, `hsl(${40 + level * 3}, 90%, 60%)`);
        skyGradient.addColorStop(0.7, `hsl(${200}, 50%, 40%)`);
        skyGradient.addColorStop(1, `hsl(${220}, 40%, 20%)`);
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, size, size);

        // Sun
        const sunX = size * (0.3 + random() * 0.4);
        const sunY = size * 0.4;
        const sunRadius = size * 0.12;

        const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius * 2);
        sunGradient.addColorStop(0, 'rgba(255, 255, 200, 1)');
        sunGradient.addColorStop(0.3, 'rgba(255, 200, 100, 0.8)');
        sunGradient.addColorStop(1, 'rgba(255, 100, 50, 0)');
        ctx.fillStyle = sunGradient;
        ctx.fillRect(0, 0, size, size);

        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#fff8e0';
        ctx.fill();

        // Clouds
        this.drawClouds(ctx, size, random, 'rgba(255, 200, 150, 0.6)');

        // Water reflection
        const waterY = size * 0.65;
        const waterGradient = ctx.createLinearGradient(0, waterY, 0, size);
        waterGradient.addColorStop(0, 'rgba(255, 150, 100, 0.5)');
        waterGradient.addColorStop(1, 'rgba(20, 50, 80, 0.9)');
        ctx.fillStyle = waterGradient;
        ctx.fillRect(0, waterY, size, size - waterY);

        // Water ripples
        this.drawWaterRipples(ctx, size, waterY, random);

        // Silhouette elements
        this.drawSilhouettes(ctx, size, random);
    }

    drawForestScene(ctx, size, random, level) {
        // Sky
        const skyGradient = ctx.createLinearGradient(0, 0, 0, size * 0.6);
        skyGradient.addColorStop(0, `hsl(${200 + level * 5}, 40%, 70%)`);
        skyGradient.addColorStop(1, `hsl(${180 + level * 3}, 30%, 85%)`);
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, size, size);

        // Misty background layers
        for (let layer = 0; layer < 4; layer++) {
            const y = size * (0.3 + layer * 0.15);
            const alpha = 0.3 + layer * 0.15;
            const hue = 120 + layer * 10 + level * 5;

            ctx.fillStyle = `hsla(${hue}, 30%, ${50 - layer * 10}%, ${alpha})`;

            ctx.beginPath();
            ctx.moveTo(0, y);
            for (let x = 0; x <= size; x += 20) {
                const noise = Math.sin(x * 0.02 + layer) * 30 + random() * 20;
                ctx.lineTo(x, y + noise);
            }
            ctx.lineTo(size, size);
            ctx.lineTo(0, size);
            ctx.closePath();
            ctx.fill();
        }

        // Trees
        const treeCount = 8 + Math.floor(random() * 5);
        for (let i = 0; i < treeCount; i++) {
            const x = random() * size;
            const height = size * (0.3 + random() * 0.4);
            const y = size - height * 0.3;
            this.drawTree(ctx, x, y, height, random);
        }

        // Foreground grass/ferns
        this.drawForegroundFoliage(ctx, size, random);

        // Floating particles (fireflies/dust)
        this.drawParticles(ctx, size, random, 'rgba(255, 255, 200, 0.8)');
    }

    drawOceanScene(ctx, size, random, level) {
        // Sky
        const skyGradient = ctx.createLinearGradient(0, 0, 0, size * 0.5);
        skyGradient.addColorStop(0, `hsl(${200 + level * 3}, 60%, 70%)`);
        skyGradient.addColorStop(1, `hsl(${190 + level * 2}, 50%, 80%)`);
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, size, size);

        // Clouds
        this.drawClouds(ctx, size, random, 'rgba(255, 255, 255, 0.8)');

        // Ocean
        const oceanY = size * 0.45;
        for (let y = oceanY; y < size; y += 3) {
            const progress = (y - oceanY) / (size - oceanY);
            const hue = 200 - progress * 20;
            const lightness = 50 - progress * 20;
            ctx.fillStyle = `hsl(${hue}, 60%, ${lightness}%)`;

            ctx.beginPath();
            ctx.moveTo(0, y);
            for (let x = 0; x <= size; x += 10) {
                const wave = Math.sin(x * 0.03 + y * 0.02 + level) * (5 - progress * 3);
                ctx.lineTo(x, y + wave);
            }
            ctx.lineTo(size, size);
            ctx.lineTo(0, size);
            ctx.fill();
        }

        // Distant islands/rocks
        for (let i = 0; i < 2 + random() * 2; i++) {
            const x = random() * size;
            const w = 30 + random() * 60;
            const h = 20 + random() * 40;
            ctx.fillStyle = `hsl(${220 + random() * 20}, 20%, ${30 + random() * 20}%)`;
            ctx.beginPath();
            ctx.ellipse(x, oceanY, w, h, 0, Math.PI, 0);
            ctx.fill();
        }

        // Moon or sun reflection
        const celestialX = size * (0.2 + random() * 0.6);
        this.drawCelestialReflection(ctx, celestialX, oceanY, size, random);
    }

    drawMountainScene(ctx, size, random, level) {
        // Sky gradient
        const skyGradient = ctx.createLinearGradient(0, 0, 0, size * 0.6);
        const timeOfDay = level % 3;
        if (timeOfDay === 0) {
            skyGradient.addColorStop(0, '#1a1a3e');
            skyGradient.addColorStop(1, '#4a3060');
        } else if (timeOfDay === 1) {
            skyGradient.addColorStop(0, '#87ceeb');
            skyGradient.addColorStop(1, '#e0f0ff');
        } else {
            skyGradient.addColorStop(0, '#ff7e5f');
            skyGradient.addColorStop(1, '#feb47b');
        }
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, size, size);

        // Stars for night
        if (timeOfDay === 0) {
            this.drawStars(ctx, size, random);
        }

        // Mountain layers
        for (let layer = 0; layer < 4; layer++) {
            const baseY = size * (0.25 + layer * 0.15);
            const color = `hsl(${240 + layer * 10}, ${20 + layer * 5}%, ${20 + layer * 15}%)`;

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(0, size);

            let x = 0;
            while (x < size) {
                const peakHeight = (random() * 0.3 + 0.2) * size * (1 - layer * 0.15);
                const peakWidth = random() * 80 + 60;

                ctx.lineTo(x, baseY);
                ctx.lineTo(x + peakWidth / 2, baseY - peakHeight);
                ctx.lineTo(x + peakWidth, baseY);

                x += peakWidth;
            }
            ctx.lineTo(size, size);
            ctx.closePath();
            ctx.fill();

            // Snow caps on first layer
            if (layer === 0) {
                this.drawSnowCaps(ctx, size, baseY, random);
            }
        }

        // Foreground details
        ctx.fillStyle = '#1a2030';
        ctx.fillRect(0, size * 0.85, size, size * 0.15);
    }

    drawDreamscape(ctx, size, random, level) {
        // Surreal gradient background
        const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size);
        gradient.addColorStop(0, `hsl(${280 + level * 20}, 70%, 60%)`);
        gradient.addColorStop(0.5, `hsl(${200 + level * 15}, 60%, 40%)`);
        gradient.addColorStop(1, `hsl(${160 + level * 10}, 50%, 20%)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        // Floating islands
        for (let i = 0; i < 3 + random() * 3; i++) {
            const x = random() * size;
            const y = random() * size * 0.7;
            const islandSize = 30 + random() * 70;
            this.drawFloatingIsland(ctx, x, y, islandSize, random);
        }

        // Giant moon/planet
        const moonX = size * (0.2 + random() * 0.6);
        const moonY = size * (0.15 + random() * 0.3);
        const moonRadius = size * (0.1 + random() * 0.15);

        const moonGradient = ctx.createRadialGradient(
            moonX - moonRadius * 0.3, moonY - moonRadius * 0.3, 0,
            moonX, moonY, moonRadius
        );
        moonGradient.addColorStop(0, `hsl(${40 + level * 10}, 30%, 90%)`);
        moonGradient.addColorStop(1, `hsl(${60 + level * 10}, 40%, 70%)`);
        ctx.fillStyle = moonGradient;
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
        ctx.fill();

        // Ethereal wisps
        for (let i = 0; i < 10; i++) {
            ctx.strokeStyle = `hsla(${180 + random() * 60}, 70%, 70%, ${0.1 + random() * 0.3})`;
            ctx.lineWidth = 2 + random() * 3;
            ctx.beginPath();
            const startX = random() * size;
            const startY = random() * size;
            ctx.moveTo(startX, startY);
            for (let j = 0; j < 5; j++) {
                ctx.quadraticCurveTo(
                    startX + (random() - 0.5) * 100,
                    startY + j * 30 + random() * 20,
                    startX + (random() - 0.5) * 80,
                    startY + (j + 1) * 30
                );
            }
            ctx.stroke();
        }

        // Glowing particles
        this.drawParticles(ctx, size, random, `hsla(${50 + level * 20}, 100%, 80%, 0.8)`);
    }

    drawAuroraScene(ctx, size, random, level) {
        // Night sky
        const skyGradient = ctx.createLinearGradient(0, 0, 0, size);
        skyGradient.addColorStop(0, '#0a0a20');
        skyGradient.addColorStop(1, '#1a1a40');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, size, size);

        // Stars
        this.drawStars(ctx, size, random);

        // Aurora borealis
        for (let band = 0; band < 5; band++) {
            const hue = 120 + band * 30 + level * 10;
            ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.3)`;
            ctx.lineWidth = 20 + random() * 30;
            ctx.lineCap = 'round';

            ctx.beginPath();
            const startY = size * (0.1 + band * 0.1);
            ctx.moveTo(0, startY);

            for (let x = 0; x <= size; x += 30) {
                const y = startY + Math.sin(x * 0.02 + band + level) * 50 + random() * 20;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        // Snowy ground
        ctx.fillStyle = '#e8f0f8';
        ctx.beginPath();
        ctx.moveTo(0, size * 0.85);
        for (let x = 0; x <= size; x += 20) {
            ctx.lineTo(x, size * 0.85 + Math.sin(x * 0.05) * 10 + random() * 5);
        }
        ctx.lineTo(size, size);
        ctx.lineTo(0, size);
        ctx.fill();

        // Pine trees silhouette
        for (let i = 0; i < 8; i++) {
            const x = i * size / 7 + random() * 30 - 15;
            const h = 40 + random() * 60;
            ctx.fillStyle = '#0a1520';
            ctx.beginPath();
            ctx.moveTo(x, size * 0.85);
            ctx.lineTo(x - h * 0.3, size * 0.85);
            ctx.lineTo(x, size * 0.85 - h);
            ctx.lineTo(x + h * 0.3, size * 0.85);
            ctx.closePath();
            ctx.fill();
        }
    }

    // Helper drawing functions
    drawClouds(ctx, size, random, color) {
        for (let i = 0; i < 5; i++) {
            const x = random() * size;
            const y = random() * size * 0.4;
            ctx.fillStyle = color;

            for (let j = 0; j < 5; j++) {
                const cx = x + j * 20 - 40;
                const cy = y + Math.sin(j) * 10;
                const r = 15 + random() * 20;
                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    drawWaterRipples(ctx, size, waterY, random) {
        for (let i = 0; i < 15; i++) {
            const x = random() * size;
            const y = waterY + random() * (size - waterY);
            const width = 20 + random() * 40;

            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + random() * 0.2})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(x, y, width, 2, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    drawSilhouettes(ctx, size, random) {
        // Palm trees or other silhouettes
        ctx.fillStyle = '#1a1020';
        for (let i = 0; i < 3; i++) {
            const x = random() * size;
            const y = size * 0.65;

            // Trunk
            ctx.fillRect(x - 3, y, 6, size - y);

            // Leaves
            for (let j = 0; j < 7; j++) {
                const angle = (j / 7) * Math.PI * 2;
                const len = 30 + random() * 20;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.quadraticCurveTo(
                    x + Math.cos(angle) * len * 0.7,
                    y + Math.sin(angle) * len * 0.3 - 10,
                    x + Math.cos(angle) * len,
                    y + Math.sin(angle) * len * 0.5
                );
                ctx.lineWidth = 3;
                ctx.strokeStyle = '#1a1020';
                ctx.stroke();
            }
        }
    }

    drawTree(ctx, x, y, height, random) {
        const trunkWidth = height * 0.08;
        const trunkHeight = height * 0.3;

        // Trunk
        ctx.fillStyle = `hsl(${25 + random() * 20}, 40%, 25%)`;
        ctx.fillRect(x - trunkWidth/2, y, trunkWidth, trunkHeight);

        // Foliage layers
        const layers = 3 + Math.floor(random() * 2);
        for (let i = 0; i < layers; i++) {
            const layerY = y - i * (height * 0.2);
            const layerWidth = (height * 0.4) * (1 - i * 0.2);
            const hue = 100 + random() * 40;

            ctx.fillStyle = `hsl(${hue}, ${40 + random() * 20}%, ${25 + i * 10}%)`;
            ctx.beginPath();
            ctx.ellipse(x, layerY, layerWidth, height * 0.15, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawForegroundFoliage(ctx, size, random) {
        for (let i = 0; i < 20; i++) {
            const x = random() * size;
            const height = 20 + random() * 40;

            ctx.strokeStyle = `hsl(${100 + random() * 40}, 50%, ${20 + random() * 20}%)`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, size);
            ctx.quadraticCurveTo(
                x + (random() - 0.5) * 20,
                size - height / 2,
                x + (random() - 0.5) * 30,
                size - height
            );
            ctx.stroke();
        }
    }

    drawParticles(ctx, size, random, color) {
        for (let i = 0; i < 30; i++) {
            const x = random() * size;
            const y = random() * size;
            const r = 1 + random() * 3;

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawStars(ctx, size, random) {
        for (let i = 0; i < 100; i++) {
            const x = random() * size;
            const y = random() * size * 0.7;
            const r = random() * 2;
            const brightness = 0.5 + random() * 0.5;

            ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawSnowCaps(ctx, size, baseY, random) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        // Simplified snow caps
    }

    drawFloatingIsland(ctx, x, y, islandSize, random) {
        // Island base
        ctx.fillStyle = `hsl(${30 + random() * 20}, 40%, 30%)`;
        ctx.beginPath();
        ctx.ellipse(x, y + islandSize * 0.3, islandSize, islandSize * 0.4, 0, 0, Math.PI);
        ctx.fill();

        // Top grass
        ctx.fillStyle = `hsl(${100 + random() * 40}, 50%, 35%)`;
        ctx.beginPath();
        ctx.ellipse(x, y + islandSize * 0.3, islandSize * 0.9, islandSize * 0.15, 0, Math.PI, 0);
        ctx.fill();

        // Small tree
        if (random() > 0.5) {
            ctx.fillStyle = `hsl(${100 + random() * 40}, 40%, 25%)`;
            ctx.beginPath();
            ctx.moveTo(x, y + islandSize * 0.15);
            ctx.lineTo(x - islandSize * 0.3, y + islandSize * 0.3);
            ctx.lineTo(x + islandSize * 0.3, y + islandSize * 0.3);
            ctx.closePath();
            ctx.fill();
        }
    }

    drawCelestialReflection(ctx, x, oceanY, size, random) {
        const gradient = ctx.createRadialGradient(x, oceanY - 30, 0, x, oceanY - 30, 40);
        gradient.addColorStop(0, 'rgba(255, 255, 220, 0.9)');
        gradient.addColorStop(1, 'rgba(255, 255, 220, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, oceanY - 30, 40, 0, Math.PI * 2);
        ctx.fill();

        // Reflection on water
        ctx.fillStyle = 'rgba(255, 255, 200, 0.3)';
        for (let y = oceanY; y < size; y += 10) {
            const width = 5 + random() * 10;
            const offset = (random() - 0.5) * 20;
            ctx.fillRect(x + offset - width/2, y, width, 5);
        }
    }


    // Space mode image generation
    async generateSpaceImage() {
        const canvas = document.createElement('canvas');
        const size = this.gridSize * this.pieceSize;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const sceneTypes = ['nebula', 'planet', 'asteroids', 'galaxy', 'station', 'binary'];
        const sceneType = sceneTypes[(this.level - 1) % sceneTypes.length];

        if (this.previousSolvedImage) {
            // Previous image becomes the background (scaled up)
            const scale = 1.5;
            const offsetX = (size - size * scale) / 2;
            const offsetY = (size - size * scale) / 2;
            ctx.drawImage(this.previousSolvedImage, offsetX, offsetY, size * scale, size * scale);

            // Draw foreground space elements on top
            this.drawSpaceSceneForeground(ctx, size, this.level, sceneType);
        } else {
            this.drawSpaceScene(ctx, size, this.level, sceneType);
        }

        this.currentImage = canvas;
        this.updatePreview(canvas);
    }

    drawSpaceSceneForeground(ctx, size, level, sceneType) {
        const seed = this.baseSeed + level * 12345;
        const random = this.seededRandom(seed);

        switch (sceneType) {
            case 'nebula':
                this.drawNebulaForeground(ctx, size, random, level);
                break;
            case 'planet':
                this.drawPlanetForeground(ctx, size, random, level);
                break;
            case 'asteroids':
                this.drawAsteroidsForeground(ctx, size, random, level);
                break;
            case 'galaxy':
                this.drawGalaxyForeground(ctx, size, random, level);
                break;
            case 'station':
                this.drawStationForeground(ctx, size, random, level);
                break;
            case 'binary':
                this.drawBinaryForeground(ctx, size, random, level);
                break;
        }

        // Add some stars/dust overlay
        this.drawSpaceDust(ctx, size, random, 0.4);
    }

    drawNebulaForeground(ctx, size, random, level) {
        // Nebula wisps around edges
        for (let i = 0; i < 4; i++) {
            const edge = i % 4;
            let x, y;
            if (edge === 0) { x = random() * size; y = size * 0.9; }
            else if (edge === 1) { x = random() * size; y = size * 0.1; }
            else if (edge === 2) { x = size * 0.9; y = random() * size; }
            else { x = size * 0.1; y = random() * size; }

            const radius = size * (0.2 + random() * 0.2);
            const hue = (level * 50 + i * 70) % 360;

            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, `hsla(${hue}, 70%, 50%, 0.6)`);
            gradient.addColorStop(0.5, `hsla(${hue + 20}, 60%, 40%, 0.3)`);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, size, size);
        }
    }

    drawPlanetForeground(ctx, size, random, level) {
        // Planet curve at bottom
        const hue = (level * 40) % 360;
        const planetY = size * 1.4;
        const planetR = size * 0.6;

        ctx.fillStyle = `hsl(${hue}, 40%, 25%)`;
        ctx.beginPath();
        ctx.arc(size * 0.5, planetY, planetR, 0, Math.PI * 2);
        ctx.fill();

        // Atmosphere glow
        const atmosGradient = ctx.createRadialGradient(
            size * 0.5, planetY, planetR - 20,
            size * 0.5, planetY, planetR + 30
        );
        atmosGradient.addColorStop(0, 'transparent');
        atmosGradient.addColorStop(0.5, `hsla(${hue + 30}, 60%, 50%, 0.3)`);
        atmosGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = atmosGradient;
        ctx.fillRect(0, 0, size, size);
    }

    drawAsteroidsForeground(ctx, size, random, level) {
        // Asteroids around the edges
        for (let i = 0; i < 8; i++) {
            const x = random() < 0.5 ? random() * size * 0.3 : size * 0.7 + random() * size * 0.3;
            const y = random() * size;
            const asteroidSize = 15 + random() * 35;
            this.drawAsteroid(ctx, x, y, asteroidSize, random);
        }
    }

    drawGalaxyForeground(ctx, size, random, level) {
        // Vignette effect
        const vignetteGradient = ctx.createRadialGradient(
            size/2, size/2, size * 0.2,
            size/2, size/2, size * 0.7
        );
        vignetteGradient.addColorStop(0, 'transparent');
        vignetteGradient.addColorStop(1, 'rgba(0, 0, 10, 0.7)');
        ctx.fillStyle = vignetteGradient;
        ctx.fillRect(0, 0, size, size);
    }

    drawStationForeground(ctx, size, random, level) {
        // Station struts in foreground
        ctx.fillStyle = '#1a1a2a';
        ctx.fillRect(0, size * 0.85, size, size * 0.15);

        // Control panel lights
        for (let i = 0; i < 8; i++) {
            const x = size * 0.1 + i * size * 0.1;
            ctx.fillStyle = `hsl(${random() * 360}, 70%, 50%)`;
            ctx.fillRect(x, size * 0.9, 8, 4);
        }

        // Window frame
        ctx.strokeStyle = '#2a2a3a';
        ctx.lineWidth = 15;
        ctx.strokeRect(0, 0, size, size);
    }

    drawBinaryForeground(ctx, size, random, level) {
        // Dark planet silhouette at bottom
        ctx.fillStyle = '#050508';
        ctx.beginPath();
        ctx.arc(size * 0.5, size * 1.3, size * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Lens flare from stars
        const flareGradient = ctx.createLinearGradient(0, 0, size, size * 0.5);
        flareGradient.addColorStop(0, 'rgba(255, 200, 150, 0.2)');
        flareGradient.addColorStop(0.5, 'transparent');
        flareGradient.addColorStop(1, 'rgba(150, 200, 255, 0.1)');
        ctx.fillStyle = flareGradient;
        ctx.fillRect(0, 0, size, size);
    }

    drawSpaceScene(ctx, size, level, sceneType) {
        const seed = this.baseSeed + level * 12345;
        const random = this.seededRandom(seed);

        // Base: deep space background
        this.drawDeepSpace(ctx, size, random, level);

        switch (sceneType) {
            case 'nebula':
                this.drawNebula(ctx, size, random, level);
                break;
            case 'planet':
                this.drawPlanetScene(ctx, size, random, level);
                break;
            case 'asteroids':
                this.drawAsteroidField(ctx, size, random, level);
                break;
            case 'galaxy':
                this.drawGalaxyScene(ctx, size, random, level);
                break;
            case 'station':
                this.drawStationScene(ctx, size, random, level);
                break;
            case 'binary':
                this.drawBinaryStars(ctx, size, random, level);
                break;
        }
    }

    drawDeepSpace(ctx, size, random, level) {
        // Dark gradient background
        const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size);
        gradient.addColorStop(0, `hsl(${240 + level * 10}, 30%, 8%)`);
        gradient.addColorStop(1, '#000005');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        // Stars
        for (let i = 0; i < 150; i++) {
            const x = random() * size;
            const y = random() * size;
            const r = random() * 1.5;
            const brightness = 0.3 + random() * 0.7;
            ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        // Distant colored stars
        for (let i = 0; i < 20; i++) {
            const x = random() * size;
            const y = random() * size;
            const hue = random() * 360;
            ctx.fillStyle = `hsla(${hue}, 80%, 70%, ${0.5 + random() * 0.5})`;
            ctx.beginPath();
            ctx.arc(x, y, 1 + random(), 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawSpaceDust(ctx, size, random, alpha) {
        for (let i = 0; i < 50; i++) {
            const x = random() * size;
            const y = random() * size;
            const r = 1 + random() * 2;
            ctx.fillStyle = `rgba(200, 220, 255, ${alpha * random()})`;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawNebula(ctx, size, random, level) {
        // Colorful nebula clouds
        for (let i = 0; i < 5; i++) {
            const x = random() * size;
            const y = random() * size;
            const radius = size * (0.2 + random() * 0.4);
            const hue = (level * 50 + i * 60) % 360;

            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, `hsla(${hue}, 80%, 50%, 0.4)`);
            gradient.addColorStop(0.5, `hsla(${hue + 30}, 70%, 40%, 0.2)`);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, size, size);
        }

        // Bright star clusters within nebula
        for (let i = 0; i < 30; i++) {
            const x = random() * size;
            const y = random() * size;
            ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + random() * 0.4})`;
            ctx.beginPath();
            ctx.arc(x, y, 1 + random() * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawPlanetScene(ctx, size, random, level) {
        // Large planet
        const planetX = size * (0.3 + random() * 0.4);
        const planetY = size * (0.3 + random() * 0.4);
        const planetR = size * (0.15 + random() * 0.2);
        const hue = (level * 40) % 360;

        // Planet body
        const planetGradient = ctx.createRadialGradient(
            planetX - planetR * 0.3, planetY - planetR * 0.3, 0,
            planetX, planetY, planetR
        );
        planetGradient.addColorStop(0, `hsl(${hue}, 50%, 60%)`);
        planetGradient.addColorStop(0.7, `hsl(${hue}, 60%, 40%)`);
        planetGradient.addColorStop(1, `hsl(${hue}, 70%, 20%)`);
        ctx.fillStyle = planetGradient;
        ctx.beginPath();
        ctx.arc(planetX, planetY, planetR, 0, Math.PI * 2);
        ctx.fill();

        // Planet rings (50% chance)
        if (random() > 0.5) {
            ctx.strokeStyle = `hsla(${hue + 30}, 40%, 70%, 0.6)`;
            ctx.lineWidth = 3 + random() * 5;
            ctx.beginPath();
            ctx.ellipse(planetX, planetY, planetR * 1.8, planetR * 0.3, random() * 0.5, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Moon
        const moonX = planetX + planetR * 1.5;
        const moonY = planetY - planetR * 0.5;
        const moonR = planetR * 0.2;
        ctx.fillStyle = '#aaa';
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
        ctx.fill();
    }

    drawAsteroidField(ctx, size, random, level) {
        // Many asteroids
        for (let i = 0; i < 25; i++) {
            const x = random() * size;
            const y = random() * size;
            const asteroidSize = 5 + random() * 25;
            this.drawAsteroid(ctx, x, y, asteroidSize, random);
        }
    }

    drawAsteroid(ctx, x, y, asteroidSize, random) {
        ctx.fillStyle = `hsl(${30 + random() * 20}, 20%, ${25 + random() * 20}%)`;
        ctx.beginPath();
        // Irregular shape
        const points = 7 + Math.floor(random() * 4);
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const r = asteroidSize * (0.7 + random() * 0.6);
            const px = x + Math.cos(angle) * r;
            const py = y + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Crater
        ctx.fillStyle = `rgba(0, 0, 0, 0.3)`;
        ctx.beginPath();
        ctx.arc(x + asteroidSize * 0.2, y - asteroidSize * 0.1, asteroidSize * 0.2, 0, Math.PI * 2);
        ctx.fill();
    }

    drawGalaxyScene(ctx, size, random, level) {
        // Spiral galaxy
        const cx = size * (0.3 + random() * 0.4);
        const cy = size * (0.3 + random() * 0.4);
        const hue = (level * 60) % 360;

        // Core glow
        const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.15);
        coreGradient.addColorStop(0, `hsla(${hue + 30}, 50%, 90%, 0.9)`);
        coreGradient.addColorStop(0.5, `hsla(${hue}, 60%, 60%, 0.5)`);
        coreGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = coreGradient;
        ctx.fillRect(0, 0, size, size);

        // Spiral arms
        for (let arm = 0; arm < 2; arm++) {
            const armOffset = arm * Math.PI;
            ctx.strokeStyle = `hsla(${hue}, 50%, 70%, 0.4)`;
            ctx.lineWidth = 8 + random() * 10;
            ctx.beginPath();
            for (let t = 0; t < 3; t += 0.1) {
                const r = t * size * 0.12;
                const angle = t * 2 + armOffset;
                const x = cx + Math.cos(angle) * r;
                const y = cy + Math.sin(angle) * r * 0.6; // Elliptical tilt
                if (t === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }

    drawStationScene(ctx, size, random, level) {
        // Space station silhouette
        const stationX = size * 0.5;
        const stationY = size * 0.5;

        ctx.fillStyle = '#1a1a2a';
        ctx.strokeStyle = '#3a3a5a';
        ctx.lineWidth = 2;

        // Main hull
        ctx.fillRect(stationX - 60, stationY - 15, 120, 30);
        ctx.strokeRect(stationX - 60, stationY - 15, 120, 30);

        // Solar panels
        ctx.fillRect(stationX - 100, stationY - 5, 35, 10);
        ctx.fillRect(stationX + 65, stationY - 5, 35, 10);

        // Panel struts
        ctx.fillRect(stationX - 80, stationY - 40, 5, 80);
        ctx.fillRect(stationX + 75, stationY - 40, 5, 80);

        // Panel arrays
        ctx.fillStyle = '#2a3a5a';
        ctx.fillRect(stationX - 95, stationY - 45, 35, 20);
        ctx.fillRect(stationX - 95, stationY + 25, 35, 20);
        ctx.fillRect(stationX + 60, stationY - 45, 35, 20);
        ctx.fillRect(stationX + 60, stationY + 25, 35, 20);

        // Lights
        ctx.fillStyle = '#ff6644';
        ctx.beginPath();
        ctx.arc(stationX - 55, stationY, 3, 0, Math.PI * 2);
        ctx.arc(stationX + 55, stationY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Window lights
        ctx.fillStyle = '#aaccff';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(stationX - 40 + i * 18, stationY - 8, 8, 6);
        }
    }

    drawBinaryStars(ctx, size, random, level) {
        // Two close stars
        const star1X = size * 0.35;
        const star1Y = size * 0.45;
        const star2X = size * 0.65;
        const star2Y = size * 0.55;
        const starR = size * 0.1;

        // Star 1 (blue-white)
        const star1Gradient = ctx.createRadialGradient(star1X, star1Y, 0, star1X, star1Y, starR * 2);
        star1Gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        star1Gradient.addColorStop(0.2, 'rgba(200, 220, 255, 0.8)');
        star1Gradient.addColorStop(0.5, 'rgba(100, 150, 255, 0.4)');
        star1Gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = star1Gradient;
        ctx.fillRect(0, 0, size, size);

        // Star 2 (orange)
        const star2Gradient = ctx.createRadialGradient(star2X, star2Y, 0, star2X, star2Y, starR * 1.8);
        star2Gradient.addColorStop(0, 'rgba(255, 255, 240, 1)');
        star2Gradient.addColorStop(0.2, 'rgba(255, 200, 100, 0.8)');
        star2Gradient.addColorStop(0.5, 'rgba(255, 150, 50, 0.4)');
        star2Gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = star2Gradient;
        ctx.fillRect(0, 0, size, size);

        // Energy stream between them
        ctx.strokeStyle = 'rgba(255, 200, 150, 0.3)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(star1X, star1Y);
        ctx.quadraticCurveTo(size * 0.5, size * 0.35, star2X, star2Y);
        ctx.stroke();
    }

    // Geometry mode image generation (original)
    async generateGeometryImage() {
        const canvas = document.createElement('canvas');
        const size = this.gridSize * this.pieceSize;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        if (this.previousSolvedImage) {
            this.drawPattern(ctx, size, this.level);

            const prevSize = size * 0.4;
            const positions = [
                { x: size * 0.1, y: size * 0.1 },
                { x: size * 0.5, y: size * 0.1 },
                { x: size * 0.1, y: size * 0.5 },
                { x: size * 0.5, y: size * 0.5 },
                { x: size * 0.3, y: size * 0.3 }
            ];
            const pos = positions[Math.floor(Math.random() * positions.length)];

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(pos.x - 5, pos.y - 5, prevSize + 10, prevSize + 10);
            ctx.drawImage(this.previousSolvedImage, pos.x, pos.y, prevSize, prevSize);
        } else {
            this.drawPattern(ctx, size, this.level);
        }

        this.currentImage = canvas;
        this.updatePreview(canvas);
    }

    drawPattern(ctx, size, level) {
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        const hue1 = (level * 47) % 360;
        const hue2 = (level * 83 + 120) % 360;
        gradient.addColorStop(0, `hsl(${hue1}, 70%, 50%)`);
        gradient.addColorStop(1, `hsl(${hue2}, 70%, 40%)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        const shapes = 5 + level * 2;
        for (let i = 0; i < shapes; i++) {
            const shapeType = (i + level) % 4;
            const x = Math.random() * size;
            const y = Math.random() * size;
            const shapeSize = 20 + Math.random() * (size / 4);
            const hue = (level * 31 + i * 67) % 360;

            ctx.fillStyle = `hsla(${hue}, 60%, 60%, 0.7)`;
            ctx.strokeStyle = `hsla(${hue}, 80%, 80%, 0.9)`;
            ctx.lineWidth = 3;

            ctx.beginPath();
            switch (shapeType) {
                case 0:
                    ctx.arc(x, y, shapeSize / 2, 0, Math.PI * 2);
                    break;
                case 1:
                    ctx.rect(x - shapeSize / 2, y - shapeSize / 2, shapeSize, shapeSize);
                    break;
                case 2:
                    ctx.moveTo(x, y - shapeSize / 2);
                    ctx.lineTo(x + shapeSize / 2, y + shapeSize / 2);
                    ctx.lineTo(x - shapeSize / 2, y + shapeSize / 2);
                    ctx.closePath();
                    break;
                case 3:
                    this.drawStar(ctx, x, y, 5, shapeSize / 2, shapeSize / 4);
                    break;
            }
            ctx.fill();
            ctx.stroke();
        }

        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = `bold ${size / 3}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`L${level}`, size / 2, size / 2);
    }

    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        const step = Math.PI / spikes;

        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
            rot += step;
            ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
    }

    seededRandom(seed) {
        let s = seed;
        return function() {
            s = Math.sin(s * 9999) * 10000;
            return s - Math.floor(s);
        };
    }

    updatePreview(canvas) {
        const previewSize = 150;
        this.previewCanvas.width = previewSize;
        this.previewCanvas.height = previewSize;
        const previewCtx = this.previewCanvas.getContext('2d');
        previewCtx.drawImage(canvas, 0, 0, previewSize, previewSize);
    }

    createPuzzle() {
        this.container.innerHTML = '';
        this.pieces = [];

        const totalPieces = this.gridSize * this.gridSize;

        this.container.style.gridTemplateColumns = `repeat(${this.gridSize}, ${this.pieceSize}px)`;
        this.container.style.gridTemplateRows = `repeat(${this.gridSize}, ${this.pieceSize}px)`;

        for (let i = 0; i < totalPieces; i++) {
            const piece = {
                id: i,
                currentPos: i,
                correctPos: i,
                element: this.createPieceElement(i)
            };
            this.pieces.push(piece);
        }

        this.shufflePieces();
        this.renderPieces();
    }

    createPieceElement(index) {
        const div = document.createElement('div');
        div.className = 'puzzle-piece';
        div.dataset.id = index;
        div.draggable = true;

        const canvas = document.createElement('canvas');
        canvas.width = this.pieceSize;
        canvas.height = this.pieceSize;
        const ctx = canvas.getContext('2d');

        const row = Math.floor(index / this.gridSize);
        const col = index % this.gridSize;
        const sx = col * this.pieceSize;
        const sy = row * this.pieceSize;

        ctx.drawImage(
            this.currentImage,
            sx, sy, this.pieceSize, this.pieceSize,
            0, 0, this.pieceSize, this.pieceSize
        );

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, this.pieceSize, this.pieceSize);

        div.appendChild(canvas);

        // Drag and drop
        div.addEventListener('dragstart', (e) => {
            this.draggedPieceId = index;
            div.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        div.addEventListener('dragend', () => {
            div.classList.remove('dragging');
            this.draggedPieceId = null;
        });

        div.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            div.classList.add('drag-over');
        });

        div.addEventListener('dragleave', () => {
            div.classList.remove('drag-over');
        });

        div.addEventListener('drop', (e) => {
            e.preventDefault();
            div.classList.remove('drag-over');
            if (this.draggedPieceId !== null && this.draggedPieceId !== index) {
                const draggedPiece = this.pieces.find(p => p.id === this.draggedPieceId);
                const targetPiece = this.pieces.find(p => p.id === index);
                this.swapPieces(draggedPiece, targetPiece);
                this.moves++;
                this.movesDisplay.textContent = this.moves;
                if (this.checkWin()) {
                    this.handleWin();
                }
            }
        });

        return div;
    }

    shufflePieces() {
        const positions = this.pieces.map((_, i) => i);

        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }

        if (!this.isSolvable(positions)) {
            [positions[0], positions[1]] = [positions[1], positions[0]];
        }

        positions.forEach((pos, i) => {
            this.pieces[i].currentPos = pos;
        });
    }

    isSolvable(positions) {
        let inversions = 0;
        for (let i = 0; i < positions.length; i++) {
            for (let j = i + 1; j < positions.length; j++) {
                if (positions[i] > positions[j]) {
                    inversions++;
                }
            }
        }
        return inversions % 2 === 0;
    }

    renderPieces() {
        this.container.innerHTML = '';
        const sortedPieces = [...this.pieces].sort((a, b) => a.currentPos - b.currentPos);

        sortedPieces.forEach(piece => {
            this.container.appendChild(piece.element);
            if (piece.currentPos === piece.correctPos) {
                piece.element.classList.add('correct');
            } else {
                piece.element.classList.remove('correct');
            }
        });
    }

    handlePieceClick(pieceId) {
        const piece = this.pieces.find(p => p.id === pieceId);

        if (this.selectedPiece === null) {
            this.selectedPiece = piece;
            piece.element.classList.add('selected');
        } else if (this.selectedPiece.id === pieceId) {
            this.selectedPiece.element.classList.remove('selected');
            this.selectedPiece = null;
        } else {
            this.swapPieces(this.selectedPiece, piece);
            this.selectedPiece.element.classList.remove('selected');
            this.selectedPiece = null;

            this.moves++;
            this.movesDisplay.textContent = this.moves;

            if (this.checkWin()) {
                this.handleWin();
            }
        }
    }

    swapPieces(piece1, piece2) {
        const tempPos = piece1.currentPos;
        piece1.currentPos = piece2.currentPos;
        piece2.currentPos = tempPos;
        this.renderPieces();
    }

    checkWin() {
        return this.pieces.every(piece => piece.currentPos === piece.correctPos);
    }

    async handleWin() {
        this.container.classList.add('celebrate');

        await this.saveSolvedImage();
        await this.delay(1500);

        this.container.classList.remove('celebrate');
        this.container.classList.add('zoom-out');

        await this.delay(1000);

        this.level++;
        this.levelDisplay.textContent = this.level;

        if (this.level % 3 === 0) {
            this.gridSize++;
        }

        await this.generateImage();
        this.createPuzzle();

        this.container.classList.remove('zoom-out');
        this.container.classList.add('zoom-in');

        this.showMessage('');

        await this.delay(1000);
        this.container.classList.remove('zoom-in');
    }

    async saveSolvedImage() {
        const canvas = document.createElement('canvas');
        const size = this.gridSize * this.pieceSize;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.currentImage, 0, 0);
        this.previousSolvedImage = canvas;
    }

    showMessage(text) {
        this.messageDisplay.textContent = text;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Mode selection and game initialization
window.addEventListener('DOMContentLoaded', () => {
    const modeSelect = document.getElementById('mode-select');
    const gameContainer = document.getElementById('game-container');
    const modeButtons = document.querySelectorAll('.mode-btn');
    const backBtn = document.getElementById('back-btn');
    const devToggle = document.getElementById('dev-toggle');
    const devOptions = document.getElementById('dev-options');
    const seedInput = document.getElementById('seed-input');
    const levelInput = document.getElementById('level-input');

    let currentGame = null;

    // Dev mode toggle
    devToggle.addEventListener('change', () => {
        devOptions.classList.toggle('hidden', !devToggle.checked);
    });

    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            modeSelect.classList.add('hidden');
            gameContainer.classList.remove('hidden');

            // Get dev options
            const options = {};
            if (devToggle.checked) {
                if (seedInput.value !== '') {
                    options.seed = parseInt(seedInput.value, 10);
                }
                if (levelInput.value !== '' && parseInt(levelInput.value, 10) > 0) {
                    options.startLevel = parseInt(levelInput.value, 10);
                }
            }

            // Reset display
            document.getElementById('level').textContent = options.startLevel || 1;
            document.getElementById('moves').textContent = '0';
            document.getElementById('preview-container').classList.remove('hidden', 'fading');

            currentGame = new InfinitePuzzle(mode, options);
        });
    });

    backBtn.addEventListener('click', () => {
        gameContainer.classList.add('hidden');
        modeSelect.classList.remove('hidden');
        currentGame = null;
    });
});
