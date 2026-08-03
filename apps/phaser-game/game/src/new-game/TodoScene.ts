import { Scene } from 'phaser';
import { socket } from '../socket';

export class TodoScene extends Scene {
    private todos: any[] = [];
    private textObjects: Phaser.GameObjects.Text[] = [];

    constructor() {
        super('TodoScene');
    }

    create() {
        this.add.text(512, 50, 'Real-time Todos (WebSockets)', {
            fontFamily: 'Arial Black', fontSize: '38px', color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        const formHtml = `
            <div style="display: flex; gap: 10px; align-items: center;">
                <input type="text" name="todoInput" placeholder="Add a new task..." 
                       style="font-size: 20px; padding: 8px; width: 300px; border: 2px solid #333; border-radius: 4px; outline: none;">
                <button name="addBtn" 
                        style="font-size: 20px; padding: 8px 16px; background-color: #00ff00; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                    Add
                </button>
            </div>
        `;

        const form = this.add.dom(512, 120).createFromHTML(formHtml);
        form.addListener('click');
        form.addListener('keydown');

        form.on('click', (event: any) => {
            if (event.target.name === 'addBtn') {
                const input = form.getChildByName('todoInput') as HTMLInputElement;
                if (input.value.trim() !== '') {
                    socket.emit('addTodo', { title: input.value.trim() });
                    input.value = '';
                }
            }
        });

        form.on('keydown', (event: any) => {
            if (event.key === 'Enter') {
                const input = form.getChildByName('todoInput') as HTMLInputElement;
                if (input.value.trim() !== '') {
                    socket.emit('addTodo', { title: input.value.trim() });
                    input.value = '';
                }
            }
        });

        const backButton = this.add.text(512, 700, '[Back to Menu]', {
            fontFamily: 'Arial', fontSize: '24px', color: '#ff0000',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        backButton.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });

        // Request initial todos (server will reply by emitting 'todosUpdated')
        socket.emit('getTodos');

        // Listen for updates
        socket.on('todosUpdated', (response: { data: any[], total: number }) => {
            this.updateTodos(response.data);
        });
    }

    updateTodos(todos: any[]) {
        this.todos = todos;
        this.renderTodos();
    }

    renderTodos() {
        // Clear old text objects
        this.textObjects.forEach(text => text.destroy());
        this.textObjects = [];

        let startY = 200;
        
        this.todos.forEach(todo => {
            const color = todo.completed ? '#aaaaaa' : '#ffffff';
            const displayTitle = todo.completed ? `[X] ${todo.title}` : `[ ] ${todo.title}`;
            
            const textObj = this.add.text(200, startY, displayTitle, {
                fontFamily: 'Arial', fontSize: '24px', color: color
            }).setInteractive({ useHandCursor: !todo.completed });

            if (!todo.completed) {
                textObj.on('pointerdown', () => {
                    socket.emit('completeTodo', { id: todo.id, completed: true });
                });
            }
            this.textObjects.push(textObj);

            // Add delete button next to it
            const deleteBtn = this.add.text(700, startY, '[🗑️]', {
                fontFamily: 'Arial', fontSize: '20px', color: '#ff5555'
            }).setInteractive({ useHandCursor: true });

            deleteBtn.on('pointerdown', () => {
                socket.emit('deleteTodo', { id: todo.id });
            });

            this.textObjects.push(deleteBtn);

            startY += 40;
        });
    }
}
