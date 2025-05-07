let paises = [];
let preguntas = [];
let indicePregunta = 0;
let respuestasCorrectas = 0;
let respuestasIncorrectas = 0;
let tiempoInicio;
let tiempoTotal = 0;
let tiempoRestante;

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
const temporizadorDiv = document.getElementById("temporizador");

const obtenerPaises = async () => {
  try {
    console.log('Obteniendo países...');
    const response = await fetch('https://restcountries.com/v3.1/all');
    const data = await response.json();
    paises = data.filter(p => p.name && p.name.common);
    generarPreguntas();
  } catch (error) {
    console.error('Error al obtener los países:', error);
  }
};

const generarPreguntas = () => {
  preguntas = [];

  while (preguntas.length < 10) {
    const pais = paises[Math.floor(Math.random() * paises.length)];

    if (pais.capital && pais.capital[0]) {
      preguntas.push({
        tipo: 'capital',
        pregunta: `¿Cuál es el país de la siguiente ciudad capital?`,
        ciudad: pais.capital[0],
        opciones: obtenerOpciones(pais.name.common),
        respuestaCorrecta: pais.name.common
      });
    }

    if (pais.flags && pais.flags.svg) {
      preguntas.push({
        tipo: 'bandera',
        pregunta: `El país representado por esta bandera es:`,
        bandera: pais.flags.svg,
        opciones: obtenerOpciones(pais.name.common),
        respuestaCorrecta: pais.name.common
      });
    }

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

  preguntas = preguntas.slice(0, 10);
  console.log('Preguntas generadas:', preguntas);
  mostrarPregunta();
};

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
    mostrarTemporizador();
  }

  pantallaInicio.classList.add("oculto");
  pantallaPregunta.classList.remove("oculto");
};

const mostrarTemporizador = () => {
  tiempoRestante = 30;
  temporizadorDiv.textContent = `Tiempo restante: ${tiempoRestante} segundos`;

  const intervalo = setInterval(() => {
    tiempoRestante--;
    temporizadorDiv.textContent = `Tiempo restante: ${tiempoRestante} segundos`;

    if (tiempoRestante <= 0) {
      clearInterval(intervalo);
      feedback.textContent = "¡Tiempo agotado!";
      feedback.style.color = "red";
      respuestasIncorrectas++;
      btnSiguiente.classList.remove("oculto");
    }
  }, 1000);
};

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
  formRanking.classList.remove("oculto");
};

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

  fetch('http://localhost:3000/api/partidas', {
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

const mostrarRanking = () => {
  fetch('http://localhost:3000/api/partidas')
    .then(response => response.json())
    .then(data => {
      listaRanking.innerHTML = '';
      data.sort((a, b) => b.puntaje - a.puntaje); 
      data.forEach((jugador, index) => {
        const li = document.createElement("li");
        li.textContent = `${index + 1}. ${jugador.nombre} - ${jugador.puntaje} puntos`;
        listaRanking.appendChild(li);
      });

      pantallaFinal.classList.add("oculto");
      pantallaRanking.classList.remove("oculto");
    });
};

btnJugar.addEventListener('click', obtenerPaises);
btnSiguiente.addEventListener('click', siguientePregunta);
btnReiniciar.addEventListener('click', () => window.location.reload());
formRanking.addEventListener('submit', guardarRanking);
