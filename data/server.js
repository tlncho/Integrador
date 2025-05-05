const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos desde /public
app.use(express.static('public'));

// Permitir recibir JSON
app.use(express.json());

// Ruta al archivo de "base de datos"
const dbFile = 'data/db.json';

// Endpoint para obtener el ranking (top 20)
app.get('/api/ranking', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
    const ranking = data.partidas
      .sort((a, b) => b.puntaje - a.puntaje || a.tiempoTotal - b.tiempoTotal)
      .slice(0, 20);
    res.json(ranking);
  } catch (error) {
    res.status(500).json({ error: 'Error al leer el archivo de datos' });
  }
});

// Endpoint para guardar una nueva partida
app.post('/api/partidas', (req, res) => {
  try {
    const nuevaPartida = req.body;
    const data = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
    data.partidas.push(nuevaPartida);
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
    res.status(201).json({ mensaje: 'Partida guardada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar la partida' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});