import { Scene, GameObjects } from 'phaser';

export class NewGameOptions extends Scene {
    background: GameObjects.Image;
    title: GameObjects.Text;

    constructor() {
        super('Options');
    }
}
