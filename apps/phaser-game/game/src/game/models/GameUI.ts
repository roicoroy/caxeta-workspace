import { Scene, GameObjects } from 'phaser';

export class GameUI {
    private scene: Scene;

    private msg_text: GameObjects.Text;
    private deckCountText: GameObjects.Text;
    private playerScoreText: GameObjects.Text;
    private opponentScoreText: GameObjects.Text;

    private bateuBtnBg: GameObjects.Rectangle;
    private bateuBtnText: GameObjects.Text;
    private homeBtnBg: GameObjects.Rectangle;
    private homeBtnText: GameObjects.Text;

    constructor(scene: Scene) {
        this.scene = scene;
        this.initializeUI();
    }

    private initializeUI() {
        // Main Message text
        this.msg_text = this.scene.add.text(512, 100, 'Cachetão\nDraw a card, then discard a card!\nDrag cards within your hand to sort them.', {
            fontFamily: 'Arial Black', fontSize: 24, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        });
        this.msg_text.setOrigin(0.5);

        // Deck Count Text
        this.deckCountText = this.scene.add.text(624, 490, '', {
            fontFamily: 'Arial', fontSize: 18, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        });
        this.deckCountText.setOrigin(0.5);

        // Scoreboards (visual only for now)
        this.playerScoreText = this.scene.add.text(20, 20, `Player: 10 pts`, {
            fontFamily: 'Arial Black', fontSize: 22, color: '#00ff00',
            stroke: '#000000', strokeThickness: 4
        });
        this.opponentScoreText = this.scene.add.text(1004, 20, `Opponent: 10 pts`, {
            fontFamily: 'Arial Black', fontSize: 22, color: '#ff0000',
            stroke: '#000000', strokeThickness: 4
        });
        this.opponentScoreText.setOrigin(1, 0);
    }

    public createBateuButton(onClick: () => void) {
        // Bottom right corner, smaller size
        this.bateuBtnBg = this.scene.add.rectangle(930, 710, 140, 45, 0xff0000).setInteractive({ cursor: 'pointer' });
        this.bateuBtnBg.setStrokeStyle(3, 0xffffff);
        this.bateuBtnBg.setDepth(100);

        this.bateuBtnText = this.scene.add.text(930, 710, 'BATEU!', {
            fontFamily: 'Arial Black', fontSize: 18, color: '#ffffff'
        }).setOrigin(0.5).setDepth(101);

        // Hover effects
        this.bateuBtnBg.on('pointerover', () => this.bateuBtnBg.setFillStyle(0xff5555));
        this.bateuBtnBg.on('pointerout', () => this.bateuBtnBg.setFillStyle(0xff0000));

        // Click
        this.bateuBtnBg.on('pointerdown', () => {
            this.bateuBtnBg.setFillStyle(0xaa0000);
            onClick();
        });
        this.bateuBtnBg.on('pointerup', () => this.bateuBtnBg.setFillStyle(0xff5555));
    }

    public createMenuButton(onClick: () => void) {
        this.homeBtnBg = this.scene.add.rectangle(60, 60, 80, 30, 0x000000, 0.6).setInteractive({ cursor: 'pointer' });
        this.homeBtnBg.setStrokeStyle(2, 0xffffff);

        this.homeBtnText = this.scene.add.text(60, 60, 'Home', {
            fontFamily: 'Arial Black', fontSize: 14, color: '#ffffff'
        }).setOrigin(0.5);

        // Hover effects
        this.homeBtnBg.on('pointerover', () => this.homeBtnBg.setFillStyle(0x333333, 0.8));
        this.homeBtnBg.on('pointerout', () => this.homeBtnBg.setFillStyle(0x000000, 0.6));

        // Click
        this.homeBtnBg.on('pointerdown', () => {
            this.homeBtnBg.setFillStyle(0x555555, 1);
            onClick();
        });
        this.homeBtnBg.on('pointerup', () => this.homeBtnBg.setFillStyle(0x333333, 0.8));
    }

    public updateDeckCount(count: number) {
        this.deckCountText.setText(`Cards: ${count}`);
    }

    public updateScores(playerScore: number, opponentScore: number) {
        this.playerScoreText.setText(`Player: ${playerScore} pts`);
        this.opponentScoreText.setText(`Opponent: ${opponentScore} pts`);
    }

    public showMessage(msg: string, color: string = '#ffffff') {
        this.msg_text.setText(msg);
        this.msg_text.setColor(color);
    }

    public handleResize(width: number, height: number, deckX: number, deckY: number) {
        this.msg_text.setPosition(width / 2, height * 0.15);

        this.opponentScoreText.setPosition(width - 20, 20);

        this.deckCountText.setPosition(deckX, deckY + 100);

        if (this.bateuBtnBg && this.bateuBtnText) {
            this.bateuBtnBg.setPosition(width - 90, height - 40);
            this.bateuBtnText.setPosition(width - 90, height - 40);
        }
    }
}
