const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));  // Sirve los archivos estáticos (HTML, CSS, JS)

/* Datos de prueba para el ranking */
let ranking = [];

// Cargar el ranking desde un archivo (o base de datos en producción)
const cargarRanking = () => {
  const archivoRanking = './ranking.json'; // Ruta directa
  if (fs.existsSync(archivoRanking)) {
    const datos = fs.readFileSync(archivoRanking);
    ranking = JSON.parse(datos);
  }
};

// Guardar el ranking en un archivo
const guardarRanking = () => {
  const archivoRanking = './ranking.json'; // Ruta directa
  fs.writeFileSync(archivoRanking, JSON.stringify(ranking, null, 2));
};

// Ruta para obtener el ranking
app.get('/api/ranking', (req, res) => {
  cargarRanking(); // Cargar el ranking actual
  // Ordenar el ranking por puntaje de mayor a menor
  ranking.sort((a, b) => b.puntaje - a.puntaje);
  res.json(ranking.slice(0, 20)); // Retornar los 20 mejores
});

// Ruta para guardar una nueva partida en el ranking
app.post('/api/partidas', (req, res) => {
  const { nombre, puntaje, tiempoTotal, respuestasCorrectas, respuestasIncorrectas } = req.body;

  // Añadir la nueva partida al ranking
  const nuevaPartida = {
    nombre,
    puntaje,
    tiempoTotal,
    respuestasCorrectas,
    respuestasIncorrectas
  };

  ranking.push(nuevaPartida);
  guardarRanking(); // Guardar el ranking actualizado

  res.status(201).json({ mensaje: 'Partida guardada correctamente' });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor en funcionamiento en http://localhost:${port}`);
});