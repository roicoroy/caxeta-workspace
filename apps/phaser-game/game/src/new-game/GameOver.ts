import { Scene } from 'phaser';

export class NewGameOver extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameover_text: Phaser.GameObjects.Text;

    constructor() {
        super('GameOver');
    }
}
