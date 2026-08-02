import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;

    private startGameBtn: { bg: GameObjects.Rectangle, text: GameObjects.Text };
    private optionsBtn: { bg: GameObjects.Rectangle, text: GameObjects.Text };

    constructor() {
        super('MainMenu');
    }

    create() {
        this.background = this.add.image(512, 384, 'background');

        this.logo = this.add.image(512, 300, 'logo');

        this.title = this.add.text(512, 460, 'Main Menu', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // Start Game Button
        this.startGameBtn = this.createButton(512, 550, 'Start Game', () => {
            this.scene.start('Game');
        });

        // Options Button
        this.optionsBtn = this.createButton(512, 630, 'Options', () => {
            this.scene.start('Options');
        });

        this.scale.on('resize', this.handleResize, this);
        this.handleResize(this.scale.gameSize);
    }

    private handleResize(gameSize: Phaser.Structs.Size) {
        const width = gameSize.width;
        const height = gameSize.height;
        const centerX = width / 2;
        const centerY = height / 2;

        this.background.setPosition(centerX, centerY);
        const scaleX = width / this.background.width;
        const scaleY = height / this.background.height;
        this.background.setScale(Math.max(scaleX, scaleY));

        this.logo.setPosition(centerX, centerY - 100);
        this.title.setPosition(centerX, centerY + 60);

        this.startGameBtn.bg.setPosition(centerX, centerY + 150);
        this.startGameBtn.text.setPosition(centerX, centerY + 150);

        this.optionsBtn.bg.setPosition(centerX, centerY + 230);
        this.optionsBtn.text.setPosition(centerX, centerY + 230);
    }

    private createButton(x: number, y: number, text: string, onClick: () => void) {
        const btnBg = this.add.rectangle(x, y, 220, 60, 0x000000, 0.6).setInteractive({ cursor: 'pointer' });
        btnBg.setStrokeStyle(4, 0xffffff);

        const btnText = this.add.text(x, y, text, {
            fontFamily: 'Arial Black', fontSize: 24, color: '#ffffff'
        }).setOrigin(0.5);

        // Hover effects
        btnBg.on('pointerover', () => btnBg.setFillStyle(0x333333, 0.8));
        btnBg.on('pointerout', () => btnBg.setFillStyle(0x000000, 0.6));

        // Click
        btnBg.on('pointerdown', () => {
            btnBg.setFillStyle(0x555555, 1);
            onClick();
        });
        btnBg.on('pointerup', () => btnBg.setFillStyle(0x333333, 0.8));

        return { bg: btnBg, text: btnText };
    }
}
