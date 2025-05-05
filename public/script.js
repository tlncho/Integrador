// Datos del juego (pueden provenir de la API o de un archivo estático para test)
const preguntas = [
  {
    tipo: "capital",
    pregunta: "¿Cuál es el país de la siguiente ciudad capital?",
    ciudad: "Buenos Aires",
    opciones: ["Argentina", "Chile", "Brasil", "Perú"],
    respuestaCorrecta: "Argentina"
  },
  {
    tipo: "bandera",
    pregunta: "El país representado por esta bandera es:",
    bandera: "🇫🇷",
    opciones: ["Francia", "Italia", "España", "Alemania"],
    respuestaCorrecta: "Francia"
  },
  {
    tipo: "limite",
    pregunta: "¿Cuántos países limítrofes tiene el siguiente país?",
    pais: "México",
    opciones: [2, 3, 4, 5],
    respuestaCorrecta: 4
  }
];

let indicePregunta = 0;
let respuestasCorrectas = 0;
let respuestasIncorrectas = 0;
let tiempoInicio;
let tiempoTotal = 0;

// Elementos del DOM
const pantallaInicio = document.getElementById("pantalla-inicio");
const pantallaPregunta = document.getElementById("pantalla-pregunta");
const pantallaFinal = document.getElementById("pantalla-final");
const pantallaRanking = document.getElementById("pantalla-ranking");
const btnJugar = document.getElementById("btn-jugar");
const btnSiguiente = document.getElementById("btn-siguiente");
const feedback = document.getElementById("feedback");
const preguntaDiv = document.getElementById("pregunta");
const opcionesDiv = document.getElementById("opciones");
const resumen = document.getElementById("resumen");
const btnReiniciar = document.getElementById("btn-reiniciar");
const formRanking = document.getElementById("form-ranking");
const listaRanking = document.getElementById("lista-ranking");

// Función para mostrar la siguiente pregunta
const mostrarPregunta = () => {
  // Reseteamos el feedback de la pregunta anterior
  feedback.textContent = "";

  // Mostramos la pregunta y las opciones
  const pregunta = preguntas[indicePregunta];
  preguntaDiv.textContent = pregunta.pregunta;

  opcionesDiv.innerHTML = ""; // Limpiamos las opciones anteriores

  // Mostramos las opciones de la pregunta actual
  pregunta.opciones.forEach(opcion => {
    const btnOpcion = document.createElement("button");
    btnOpcion.textContent = opcion;
    btnOpcion.onclick = () => verificarRespuesta(opcion, pregunta.respuestaCorrecta);
    opcionesDiv.appendChild(btnOpcion);
  });

  // Iniciar el temporizador
  if (indicePregunta === 0) {
    tiempoInicio = Date.now();
  }

  // Ocultamos pantalla de inicio y mostramos la pregunta
  pantallaInicio.classList.add("oculto");
  pantallaPregunta.classList.remove("oculto");
};

// Función para verificar la respuesta
const verificarRespuesta = (respuesta, correcta) => {
  if (respuesta === correcta) {
    feedback.textContent = "¡Correcto!";
    feedback.style.color = "green";
    respuestasCorrectas++;
  } else {
    feedback.textContent = `Incorrecto. La respuesta correcta es: ${correcta}`;
    feedback.style.color = "red";
    respuestasIncorrectas++;
  }

  // Detenemos el temporizador y calculamos el tiempo total
  tiempoTotal = Date.now() - tiempoInicio;

  // Mostramos el botón de siguiente pregunta
  btnSiguiente.classList.remove("oculto");
};

// Función para pasar a la siguiente pregunta
const siguientePregunta = () => {
  // Reseteamos la pantalla de feedback y ocultamos el botón de siguiente
  feedback.textContent = "";
  btnSiguiente.classList.add("oculto");

  // Aumentamos el índice de la pregunta actual
  indicePregunta++;

  // Si ya no hay más preguntas, mostramos la pantalla final
  if (indicePregunta < preguntas.length) {
    mostrarPregunta();
  } else {
    mostrarPantallaFinal();
  }
};

// Función para mostrar la pantalla final con el resumen
const mostrarPantallaFinal = () => {
  // Calcular tiempo promedio por pregunta
  const tiempoPromedio = tiempoTotal / preguntas.length / 1000;

  // Mostrar resumen de resultados
  resumen.innerHTML = `
    Respuestas Correctas: ${respuestasCorrectas}<br>
    Respuestas Incorrectas: ${respuestasIncorrectas}<br>
    Tiempo Total: ${Math.round(tiempoTotal / 1000)} segundos<br>
    Tiempo Promedio por Pregunta: ${tiempoPromedio.toFixed(2)} segundos
  `;

  // Ocultamos la pantalla de pregunta y mostramos la final
  pantallaPregunta.classList.add("oculto");
  pantallaFinal.classList.remove("oculto");
};

// Función para guardar el ranking
const guardarRanking = (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;

  // Guardamos la partida en el ranking (aquí usarías una API o base de datos real)
  const partida = {
    nombre,
    puntaje: respuestasCorrectas * 10, // Ejemplo: 10 puntos por respuesta correcta
    tiempoTotal,
    respuestasCorrectas,
    respuestasIncorrectas
  };

  // Enviar a la API o base de datos
  fetch('/api/partidas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(partida)
  })
  .then(response => response.json())
  .then(() => {
    // Mostrar ranking
    mostrarRanking();
  })
  .catch(error => {
    console.error('Error al guardar la partida:', error);
  });
};

// Función para mostrar el ranking
const mostrarRanking = () => {
  fetch('/api/ranking')
    .then(response => response.json())
    .then(data => {
      listaRanking.innerHTML = '';
      data.forEach((jugador, index) => {
        const li = document.createElement("li");
        li.textContent = `${index + 1}. ${jugador.nombre} - ${jugador.puntaje} puntos`;
        listaRanking.appendChild(li);
      });

      // Mostrar la pantalla de ranking
      pantallaFinal.classList.add("oculto");
      pantallaRanking.classList.remove("oculto");
    });
};

// Inicialización
btnJugar.addEventListener('click', mostrarPregunta);
btnSiguiente.addEventListener('click', siguientePregunta);
btnReiniciar.addEventListener('click', () => window.location.reload());
formRanking.addEventListener('submit', guardarRanking);