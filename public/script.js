let paises = [];
let preguntas = [];
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

// Obtener países desde la API
const obtenerPaises = async () => {
  try {
    const response = await fetch('https://restcountries.com/v3.1/all');
    const data = await response.json();
    paises = data.filter(p => p.name && p.name.common); // Validamos nombre
    generarPreguntas();
  } catch (error) {
    console.error('Error al obtener los países:', error);
  }
};

// Generar preguntas con opciones válidas
const generarPreguntas = () => {
  preguntas = [];

  for (let i = 0; i < 10; i++) {
    const pais = paises[Math.floor(Math.random() * paises.length)];

    // Pregunta sobre capital
    if (pais.capital && pais.capital[0]) {
      preguntas.push({
        tipo: 'capital',
        pregunta: `¿Cuál es el país de la siguiente ciudad capital?`,
        ciudad: pais.capital[0],
        opciones: obtenerOpciones(pais.name.common),
        respuestaCorrecta: pais.name.common
      });
    }

    // Pregunta sobre bandera
    if (pais.flags && pais.flags.svg) {
      preguntas.push({
        tipo: 'bandera',
        pregunta: `El país representado por esta bandera es:`,
        bandera: pais.flags.svg,
        opciones: obtenerOpciones(pais.name.common),
        respuestaCorrecta: pais.name.common
      });
    }

    // Pregunta sobre países limítrofes
    if (Array.isArray(pais.borders)) {
      preguntas.push({
        tipo: 'limite',
        pregunta: `¿Cuántos países limítrofes tiene ${pais.name.common}?`,
        pais: pais.name.common,
        opciones: generarOpcionesLimite(pais.borders.length),
        respuestaCorrecta: pais.borders.length
      });
    }
  }

  mostrarPregunta();
};

// Generar opciones incluyendo la correcta y sin duplicados
const obtenerOpciones = (respuestaCorrecta) => {
  const opciones = new Set();
  opciones.add(respuestaCorrecta);

  while (opciones.size < 4) {
    const paisAleatorio = paises[Math.floor(Math.random() * paises.length)].name.common;
    if (paisAleatorio && paisAleatorio !== respuestaCorrecta) {
      opciones.add(paisAleatorio);
    }
  }

  return Array.from(opciones).sort(() => Math.random() - 0.5);
};

// Opciones para preguntas de cantidad de fronteras
const generarOpcionesLimite = (correcta) => {
  const opciones = new Set();
  opciones.add(correcta);
  while (opciones.size < 4) {
    const num = Math.floor(Math.random() * 6) + 1;
    if (num !== correcta) {
      opciones.add(num);
    }
  }
  return Array.from(opciones).sort(() => Math.random() - 0.5);
};

// Mostrar la pregunta actual
const mostrarPregunta = () => {
  feedback.textContent = "";
  const pregunta = preguntas[indicePregunta];
  preguntaDiv.textContent = pregunta.pregunta;
  opcionesDiv.innerHTML = "";

  if (pregunta.tipo === "capital") {
    preguntaDiv.textContent = `${pregunta.pregunta} ${pregunta.ciudad}`;
  } else if (pregunta.tipo === "bandera") {
    preguntaDiv.innerHTML = `${pregunta.pregunta} <img src="${pregunta.bandera}" alt="Bandera" width="50" />`;
  }

  pregunta.opciones.forEach(opcion => {
    const btnOpcion = document.createElement("button");
    btnOpcion.textContent = opcion;
    btnOpcion.onclick = () => verificarRespuesta(opcion, pregunta.respuestaCorrecta);
    opcionesDiv.appendChild(btnOpcion);
  });

  if (indicePregunta === 0) {
    tiempoInicio = Date.now();
  }

  pantallaInicio.classList.add("oculto");
  pantallaPregunta.classList.remove("oculto");
};

// Verificar si la respuesta es correcta
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

  tiempoTotal = Date.now() - tiempoInicio;
  btnSiguiente.classList.remove("oculto");
};

// Siguiente pregunta o pantalla final
const siguientePregunta = () => {
  feedback.textContent = "";
  btnSiguiente.classList.add("oculto");
  indicePregunta++;

  if (indicePregunta < preguntas.length) {
    mostrarPregunta();
  } else {
    mostrarPantallaFinal();
  }
};

// Mostrar resultados finales
const mostrarPantallaFinal = () => {
  const tiempoPromedio = tiempoTotal / preguntas.length / 1000;

  resumen.innerHTML = `
    Respuestas Correctas: ${respuestasCorrectas}<br>
    Respuestas Incorrectas: ${respuestasIncorrectas}<br>
    Tiempo Total: ${Math.round(tiempoTotal / 1000)} segundos<br>
    Tiempo Promedio por Pregunta: ${tiempoPromedio.toFixed(2)} segundos
  `;

  pantallaPregunta.classList.add("oculto");
  pantallaFinal.classList.remove("oculto");
};

// Guardar en ranking
const guardarRanking = (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value;

  const partida = {
    nombre,
    puntaje: respuestasCorrectas * 10,
    tiempoTotal,
    respuestasCorrectas,
    respuestasIncorrectas
  };

  fetch('/api/partidas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(partida)
  })
  .then(response => response.json())
  .then(() => {
    mostrarRanking();
  })
  .catch(error => {
    console.error('Error al guardar la partida:', error);
  });
};

// Mostrar ranking
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

      pantallaFinal.classList.add("oculto");
      pantallaRanking.classList.remove("oculto");
    });
};

// Eventos
btnJugar.addEventListener('click', obtenerPaises);
btnSiguiente.addEventListener('click', siguientePregunta);
btnReiniciar.addEventListener('click', () => window.location.reload());
formRanking.addEventListener('submit', guardarRanking);
