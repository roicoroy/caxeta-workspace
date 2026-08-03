import { Scene, GameObjects } from 'phaser';
import { socket } from '../socket';

export class NewMainMenu extends Scene {
    background: GameObjects.TileSprite;
    logo: GameObjects.Image;
    streaksContainer: GameObjects.Container;
    clouds: GameObjects.Image[] = [];

    constructor() {
        super('MainMenu');
    }

    create() {
        // Use TileSprite for the background to allow infinite scrolling
        // The screen size is 768x1024. Anchor the background to the bottom (y=1024).
        this.background = this.add.tileSprite(384, 1024, 768, 1000, 'backgroundSet');
        this.background.setOrigin(0.5, 0.75);

        // Add scrolling clouds without tweens to avoid wrapping glitches
        this.clouds = [
            this.add.image(0, 150, 'cloud').setAlpha(0.7),
            this.add.image(400, 300, 'cloud').setAlpha(0.5),
            this.add.image(800, 100, 'cloud').setAlpha(0.6)
        ];

        // Add streaks (sunburst) behind the logo
        this.streaksContainer = this.add.container(384, 300);
        const count = 18;
        for (let i = 0; i < count; i++) {
            const streak = this.add.image(0, 0, 'streaksFade');
            streak.setOrigin(0, 0.5);
            streak.setAngle(i * (360 / count));
            streak.setDisplaySize(600, (600 / count) * 2.666);
            streak.setAlpha(0.2);
            this.streaksContainer.add(streak);
        }

        // Add the Title Logo and transition it in (Start at 2.5 scale, bounce to 1)
        this.logo = this.add.image(384, 300, 'titleLogo');
        this.logo.setScale(2.5);
        this.tweens.add({
            targets: this.logo,
            scale: 1,
            duration: 333,
            ease: 'Quad.easeOut'
        });

        // Add the Start Button
        const startBtn = this.add.image(384, 600, 'buttonStart')
            .setInteractive({ useHandCursor: true });

        // Add breathing effect
        this.tweens.add({
            targets: startBtn,
            scale: 1.05,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        startBtn.on('pointerdown', () => {
            this.scene.start('TodoScene');
        });

        // Add hover effect for Start Button
        startBtn.on('pointerover', () => startBtn.setTint(0xcccccc));
        startBtn.on('pointerout', () => startBtn.clearTint());

        // Add the Help Background Panel (Hidden by default)
        const helpPanel = this.add.image(384, 512, 'helpBackground')
            .setVisible(false)
            .setDepth(10) // Ensure it appears above everything else
            .setInteractive({ useHandCursor: true });

        // Tap panel to close it
        helpPanel.on('pointerdown', () => {
            helpPanel.setVisible(false);
        });

        // Add the Help Button
        const helpBtn = this.add.image(384, 700, 'buttonHelp')
            .setInteractive({ useHandCursor: true });

        helpBtn.on('pointerdown', () => {
            helpPanel.setVisible(true);
        });

        // Add hover effect for Help Button
        helpBtn.on('pointerover', () => helpBtn.setTint(0xcccccc));
        helpBtn.on('pointerout', () => helpBtn.clearTint());

        // Add a text element for server connection errors
        const errorText = this.add.text(384, 950, 'Server Connection Failed', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5).setVisible(false).setDepth(20);

        socket.on('connect_error', () => {
            errorText.setVisible(true);
            errorText.setText('Server Connection Failed\nRetrying...');
        });

        socket.on('connect', () => {
            errorText.setVisible(false);
        });
    }

    update(time: number, delta: number) {
        // Scroll the background tile sprite
        this.background.tilePositionX += 0.5 * (delta / 16.6);

        // Move the clouds manually and wrap them
        this.clouds.forEach(cloud => {
            cloud.x += 0.8 * (delta / 16.6);
            if (cloud.x > 768 + cloud.width / 2) {
                cloud.x = -cloud.width / 2;
            }
        });

        // Rotate the light rays sunburst effect
        if (this.streaksContainer) {
            this.streaksContainer.angle += 0.5 * (delta / 16.6);
        }
    }
}
