const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Middleware para parsear JSON y servir archivos estáticos
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Ruta POST para guardar partidas
app.post('/api/partidas', (req, res) => {
  const dataPath = path.join(__dirname, 'db.json'); 
  let db;

  try {
    db = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  } catch (err) {
    db = { partidas: [] };
  }

  const nuevaPartida = req.body;
  db.partidas.push(nuevaPartida);

  try {
    fs.writeFileSync(dataPath, JSON.stringify(db, null, 2));
    res.status(201).json(nuevaPartida);
  } catch (err) {
    console.error('Error al guardar la partida:', err);
    res.status(500).json({ error: 'No se pudo guardar la partida' });
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});