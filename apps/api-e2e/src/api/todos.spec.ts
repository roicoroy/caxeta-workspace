import axios from 'axios';

describe('Todos API (e2e)', () => {
  it('GET /api/todos should return the initial list of todos', async () => {
    const res = await axios.get('/api/todos');

    expect(res.status).toBe(200);
    expect(res.data.data).toBeDefined();
    expect(res.data.total).toBeGreaterThanOrEqual(2);
  });

  it('POST /api/todos should create a new todo', async () => {
    const newTodo = { title: 'Test e2e todo' };
    const res = await axios.post('/api/todos', newTodo);

    expect(res.status).toBe(201);
    expect(res.data.title).toBe(newTodo.title);
    expect(res.data.completed).toBe(false);
    expect(res.data.id).toBeDefined();
  });
  it('DELETE /api/todos/:id should remove a todo', async () => {
    // First create a todo
    const createRes = await axios.post('/api/todos', { title: 'Todo to delete' });
    const todoId = createRes.data.id;

    // Then delete it
    const deleteRes = await axios.delete(`/api/todos/${todoId}`);
    expect(deleteRes.status).toBe(200);

    // Verify it's gone
    const getRes = await axios.get('/api/todos');
    const todos = getRes.data.data;
    const exists = todos.some((t: any) => t.id === todoId);
    expect(exists).toBe(false);
  });
});
