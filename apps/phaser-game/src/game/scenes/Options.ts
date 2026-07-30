import { Scene, GameObjects } from 'phaser';

export class Options extends Scene {
    background: GameObjects.Image;
    title: GameObjects.Text;
    
    private option1: GameObjects.Text;
    private option2: GameObjects.Text;
    private backBtn: { bg: GameObjects.Rectangle, text: GameObjects.Text };

    constructor() {
        super('Options');
    }

    create() {
        this.background = this.add.image(512, 384, 'background');

        this.title = this.add.text(512, 100, 'Options', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // Placeholder Option 1
        this.option1 = this.add.text(512, 300, 'Jokers (Coringas): ON', {
            fontFamily: 'Arial Black', fontSize: 24, color: '#aaaaaa'
        }).setOrigin(0.5);

        // Placeholder Option 2
        this.option2 = this.add.text(512, 400, 'Difficulty: Normal', {
            fontFamily: 'Arial Black', fontSize: 24, color: '#aaaaaa'
        }).setOrigin(0.5);

        // Back Button
        this.backBtn = this.createButton(512, 600, 'Back', () => {
            this.scene.start('MainMenu');
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

        this.title.setPosition(centerX, centerY - 200);
        this.option1.setPosition(centerX, centerY - 50);
        this.option2.setPosition(centerX, centerY + 50);

        this.backBtn.bg.setPosition(centerX, centerY + 200);
        this.backBtn.text.setPosition(centerX, centerY + 200);
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
