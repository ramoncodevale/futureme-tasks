import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';
import cors from 'cors'; 

const app = express();
const port = 3001;

app.use(cors());

app.use(express.json());

const db = new sqlite3.Database(path.resolve(__dirname, 'tasks.db'), (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados', err);
  } else {
    console.log('Banco de dados conectado!');
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL
  )
`);

app.post('/tasks', (req, res) => {
  const { title, description, status } = req.body;
  const query = 'INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)';
  
  db.run(query, [title, description, status], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, title, description, status });
  });
});

app.get('/tasks', (req, res) => {
  db.all('SELECT * FROM tasks', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.put('/tasks/:id', (req, res) => {
  const { title, description, status } = req.body;
  const query = 'UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?';
  
  db.run(query, [title, description, status, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    res.json({ id: req.params.id, title, description, status });
  });
});

app.delete('/tasks/:id', (req, res) => {
  const query = 'DELETE FROM tasks WHERE id = ?';
  
  db.run(query, [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    res.status(204).end();
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
