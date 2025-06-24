// Elementos del DOM
const pantallaInicial = document.getElementById('pantalla-inicial');
const pantallaJuego = document.getElementById('pantalla-juego');
const pantallaRecords = document.getElementById('pantalla-records');
const formularioNombre = document.getElementById('formulario-nombre');
const inputNombre = document.getElementById('nombre-jugador');
const nombreDisplay = document.getElementById('nombre-display');
const intentosDisplay = document.getElementById('intentos');
const aciertosDisplay = document.getElementById('aciertos');
const tiempoDisplay = document.getElementById('tiempo');
const nivelDisplay = document.getElementById('nivel');
const tablero = document.getElementById('tablero');
const botonIniciar = document.getElementById('iniciar');
const mensaje = document.getElementById('mensaje');
const mensajeTexto = document.getElementById('mensaje-texto');
const mensajeCerrar = document.getElementById('mensaje-cerrar');
const victoria = document.getElementById('victoria');
const nivelCompletado = document.getElementById('nivel-completado');
const intentosFinal = document.getElementById('intentos-final');
const tiempoFinal = document.getElementById('tiempo-final');
const siguienteNivel = document.getElementById('siguiente-nivel');
const reiniciar = document.getElementById('reiniciar');
const derrota = document.getElementById('derrota');
const reintentar = document.getElementById('reintentar');
const volverMenu = document.getElementById('volver-menu');
const volverRecords = document.getElementById('volver');
const listaRecords = document.getElementById('lista-records');
const tablaJugadoresBody = document.getElementById('tabla-jugadores-body');
const sinJugadores = document.getElementById('sin-jugadores');

// Variables del juego
let nombreJugador = '';
let nivel = 1;
let intentos = 0;
let aciertos = 0;
let tiempoRestante = 0;
let temporizador = null;
let cartasSeleccionadas = [];
let cartasBloqueadas = [];
let juegoIniciado = false;
let todasLasCartas = [];
let sonidoSeleccion = new Audio('sonidos/SELECCION.mp3');
let sonidoAcierto = new Audio('sonidos/ACERTAR.mp3');
let sonidoError = new Audio('sonidos/FAIL.mp3');
let sonidoVictoria = new Audio('sonidos/FINISH.mp3');
let sonidoDerrota = new Audio('sonidos/GAME OVER.mp3');

// Imágenes para el juego
const imagenes = [
    'imagenes/Jokers14.png',
    'imagenes/Jokers44.png',
    'imagenes/Jokers74.png',
    'imagenes/Jokers76.png',
    'imagenes/Jokers135.png',
    'imagenes/Jokers142.png',
    'imagenes/Jokers65.png',
    'imagenes/Jokers64.png',
    'imagenes/Jokers77.png'
];

// Configuración de dificultad por nivel
const configuracionNiveles = {
    1: {
        tiempo: 5 * 60, // 5 minutos en segundos
        cartas: 12
    },
    2: {
        tiempo: 3 * 60, // 3 minutos en segundos
        cartas: 16
    },
    3: {
        tiempo: 2 * 60, // 2 minutos en segundos
        cartas: 20
    }
};

// Evento para el formulario de nombre
formularioNombre.addEventListener('submit', function(e) {
    e.preventDefault();
    if (inputNombre.value.trim() !== '') {
        nombreJugador = inputNombre.value.trim();
        localStorage.setItem('nombreJugador', nombreJugador);
        nombreDisplay.textContent = nombreJugador;
        pantallaInicial.classList.add('oculto');
        pantallaJuego.classList.remove('oculto');
        prepararJuego();
    }
});

// Evento para iniciar el juego
botonIniciar.addEventListener('click', iniciarJuego);

// Evento para cerrar mensajes
mensajeCerrar.addEventListener('click', function() {
    mensaje.classList.add('oculto');
});

// Eventos para la pantalla de victoria
siguienteNivel.addEventListener('click', function() {
    victoria.classList.add('oculto');
    nivel++;
    if (nivel > 3) {
        nivel = 1;
        mostrarMensaje("¡Has completado todos los niveles! Comenzando desde el nivel 1.");
    }
    nivelDisplay.textContent = nivel;
    prepararJuego();
});

reiniciar.addEventListener('click', function() {
    victoria.classList.add('oculto');
    prepararJuego();
});

// Eventos para la pantalla de derrota
reintentar.addEventListener('click', function() {
    derrota.classList.add('oculto');
    prepararJuego();
});

volverMenu.addEventListener('click', function() {
    derrota.classList.add('oculto');
    pantallaJuego.classList.add('oculto');
    pantallaInicial.classList.remove('oculto');
    restablecer();
    mostrarTablaJugadores();
});

// Evento para volver de los récords
volverRecords.addEventListener('click', function() {
    pantallaRecords.classList.add('oculto');
    pantallaJuego.classList.remove('oculto');
});

// Función para preparar el juego según el nivel
function prepararJuego() {
    // Detener cualquier temporizador anterior
    if (temporizador) {
        clearInterval(temporizador);
        temporizador = null;
    }
    
    // Restablecer valores
    intentos = 0;
    aciertos = 0;
    cartasSeleccionadas = [];
    cartasBloqueadas = [];
    juegoIniciado = false;
    
    // Actualizar displays
    intentosDisplay.textContent = intentos;
    aciertosDisplay.textContent = aciertos;
    nivelDisplay.textContent = nivel;
    
    // Obtener configuración del nivel actual
    const configNivel = configuracionNiveles[nivel];
    tiempoRestante = configNivel.tiempo;
    actualizarTiempo();
    
    // Habilitar botón de inicio
    botonIniciar.disabled = false;
    botonIniciar.textContent = 'Iniciar Juego';
    
    // Crear el tablero según el nivel
    crearTablero(configNivel.cartas);
}

// Función para iniciar el juego
function iniciarJuego() {
    if (juegoIniciado) return;
    
    juegoIniciado = true;
    botonIniciar.disabled = true;
    botonIniciar.textContent = 'Juego en curso';
    
    // Iniciar temporizador
    temporizador = setInterval(function() {
        tiempoRestante--;
        actualizarTiempo();
        
        if (tiempoRestante <= 0) {
            clearInterval(temporizador);
            temporizador = null;
            finalizarJuego(false);
        }
    }, 1000);
}

// Función para actualizar el display del tiempo
function actualizarTiempo() {
    const minutos = Math.floor(tiempoRestante / 60);
    const segundos = tiempoRestante % 60;
    tiempoDisplay.textContent = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
}

// Función para crear el tablero de juego
function crearTablero(numCartas) {
    // Limpiar el tablero
    tablero.innerHTML = '';
    
    // Determinar cuántas imágenes diferentes necesitamos
    const paresNecesarios = numCartas / 2;
    
    // Crear array con pares de cartas
    let cartasPorUsar = [];
    
    // Si tenemos suficientes imágenes, usamos las que necesitemos
    if (imagenes.length >= paresNecesarios) {
        for (let i = 0; i < paresNecesarios; i++) {
            cartasPorUsar.push(imagenes[i]);
            cartasPorUsar.push(imagenes[i]);
        }
    } else {
        // Si no tenemos suficientes imágenes, repetimos algunas
        let indiceImagen = 0;
        for (let i = 0; i < paresNecesarios; i++) {
            cartasPorUsar.push(imagenes[indiceImagen]);
            cartasPorUsar.push(imagenes[indiceImagen]);
            indiceImagen = (indiceImagen + 1) % imagenes.length;
        }
    }
    
    // Mezclar las cartas
    cartasPorUsar = mezclarArray(cartasPorUsar);
    todasLasCartas = cartasPorUsar;
    
    // Crear elementos de cartas en el DOM
    cartasPorUsar.forEach((imagen, index) => {
        const carta = document.createElement('div');
        carta.classList.add('carta');
        carta.dataset.id = index;
        carta.dataset.imagen = imagen;
        
        const cartaFrente = document.createElement('div');
        cartaFrente.classList.add('carta-frente');
        
        const imagenFrente = document.createElement('img');
        // Precargar la imagen para asegurar que esté disponible cuando se voltee la carta
        imagenFrente.src = imagen;
        imagenFrente.alt = 'Carta ' + (index + 1);
        
        const cartaDorso = document.createElement('div');
        cartaDorso.classList.add('carta-dorso');
        
        const imagenDorso = document.createElement('img');
        imagenDorso.src = 'imagenes/Deck Backs9.png';
        imagenDorso.alt = 'Dorso de carta';
        
        cartaFrente.appendChild(imagenFrente);
        cartaDorso.appendChild(imagenDorso);
        
        carta.appendChild(cartaFrente);
        carta.appendChild(cartaDorso);
        
        carta.addEventListener('click', () => seleccionarCarta(carta));
        
        tablero.appendChild(carta);
    });

    // Verificar que las cartas fueron creadas correctamente
    console.log(`Tablero creado con ${numCartas} cartas.`);
    
    // Ajustar el grid según el número de cartas
    if (numCartas === 12) {
        tablero.style.gridTemplateColumns = 'repeat(4, 1fr)';
    } else if (numCartas === 16) {
        tablero.style.gridTemplateColumns = 'repeat(4, 1fr)';
    } else if (numCartas === 20) {
        tablero.style.gridTemplateColumns = 'repeat(5, 1fr)';
    }
}

// Función para seleccionar una carta
function seleccionarCarta(carta) {
    // Verificar si el juego está iniciado
    if (!juegoIniciado) {
        mostrarMensaje("Debes iniciar el juego primero");
        return;
    }
    
    // Verificar si la carta ya está volteada o bloqueada
    if (carta.classList.contains('volteada') || cartasBloqueadas.includes(carta.dataset.id)) {
        mostrarMensaje("Debes seleccionar otra imagen");
        return;
    }
    
    // Verificar si ya hay dos cartas seleccionadas
    if (cartasSeleccionadas.length >= 2) {
        return;
    }
    
    // Reproducir sonido de selección
    sonidoSeleccion.play();
    
    // Voltear la carta
    carta.classList.add('volteada');
    cartasSeleccionadas.push(carta);
    
    // Asegurar que la imagen frontal esté cargada correctamente
    const imgFrente = carta.querySelector('.carta-frente img');
    if (imgFrente.src !== carta.dataset.imagen) {
        imgFrente.src = carta.dataset.imagen;
    }
    
    // Si hay dos cartas seleccionadas, comprobar si son pareja
    if (cartasSeleccionadas.length === 2) {
        intentos++;
        intentosDisplay.textContent = intentos;
        
        const carta1 = cartasSeleccionadas[0];
        const carta2 = cartasSeleccionadas[1];
        
        if (carta1.dataset.imagen === carta2.dataset.imagen) {
            // Es una pareja
            sonidoAcierto.play();
            aciertos++;
            aciertosDisplay.textContent = aciertos;
            
            // Bloquear las cartas encontradas
            cartasBloqueadas.push(carta1.dataset.id);
            cartasBloqueadas.push(carta2.dataset.id);
            
            // Limpiar selección
            cartasSeleccionadas = [];
            
            // Verificar si se completó el juego
            comprobarVictoria();
        } else {
            // No es pareja
            sonidoError.play();
            
            // Dar tiempo para ver las cartas antes de voltearlas
            setTimeout(() => {
                carta1.classList.remove('volteada');
                carta2.classList.remove('volteada');
                cartasSeleccionadas = [];
            }, 1000);
        }
    }
}

// Función para comprobar victoria
function comprobarVictoria() {
    const configNivel = configuracionNiveles[nivel];
    if (aciertos === configNivel.cartas / 2) {
        clearInterval(temporizador);
        temporizador = null;
        
        // Guardar récord
        guardarRecord();
        
        // Mostrar pantalla de victoria con delay para que se vea la última carta
        setTimeout(() => {
            finalizarJuego(true);
        }, 500);
    }
}

// Función para finalizar el juego
function finalizarJuego(esVictoria) {
    juegoIniciado = false;
    
    if (esVictoria) {
        sonidoVictoria.play();
        nivelCompletado.textContent = nivel;
        intentosFinal.textContent = intentos;
        tiempoFinal.textContent = tiempoDisplay.textContent;
        victoria.classList.remove('oculto');
        
        // Mostrar el botón correcto según el nivel
        if (nivel < 3) {
            siguienteNivel.classList.remove('oculto');
            siguienteNivel.textContent = `Ir al Nivel ${nivel + 1}`;
        } else {
            siguienteNivel.textContent = 'Jugar de nuevo';
        }
    } else {
        sonidoDerrota.play();
        derrota.classList.remove('oculto');
    }
}

// Función para guardar récord en localStorage
function guardarRecord() {
    const tiempoUsado = configuracionNiveles[nivel].tiempo - tiempoRestante;
    const minutos = Math.floor(tiempoUsado / 60);
    const segundos = tiempoUsado % 60;
    const tiempoFormateado = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
    
    const record = {
        nombre: nombreJugador,
        nivel,
        intentos,
        aciertos,
        tiempo: tiempoFormateado,
        tiempoRestante: `${Math.floor(tiempoRestante / 60).toString().padStart(2, '0')}:${(tiempoRestante % 60).toString().padStart(2, '0')}`,
        fecha: new Date().toLocaleDateString()
    };
    
    let records = JSON.parse(localStorage.getItem('records') || '[]');
    records.push(record);
    
    // Ordenar por nivel y luego por intentos (menor a mayor)
    records.sort((a, b) => {
        if (a.nivel !== b.nivel) {
            return b.nivel - a.nivel; // Mayor nivel primero
        }
        return a.intentos - b.intentos; // Menor número de intentos primero
    });
    
    // Guardar máximo 10 récords
    if (records.length > 10) {
        records = records.slice(0, 10);
    }
    
    localStorage.setItem('records', JSON.stringify(records));
    
    // Actualizar la tabla de jugadores
    mostrarTablaJugadores();
}

// Función para mostrar la tabla de jugadores registrados
function mostrarTablaJugadores() {
    let records = JSON.parse(localStorage.getItem('records') || '[]');
    
    if (records.length === 0) {
        tablaJugadoresBody.innerHTML = '';
        sinJugadores.classList.remove('oculto');
        return;
    }
    
    sinJugadores.classList.add('oculto');
    let html = '';
    
    // Eliminar duplicados (conservar solo el último registro por jugador)
    const jugadoresUnicos = {};
    records.forEach(record => {
        jugadoresUnicos[record.nombre] = record;
    });
    
    const jugadoresFiltrados = Object.values(jugadoresUnicos);
    
    // Ordenar jugadores por nivel e intentos
    jugadoresFiltrados.sort((a, b) => {
        if (a.nivel !== b.nivel) {
            return b.nivel - a.nivel; // Mayor nivel primero
        }
        return a.intentos - b.intentos; // Menor número de intentos primero
    });
    
    // Generar filas de la tabla
    jugadoresFiltrados.forEach((record, index) => {
        html += `<tr>
            <td>${index + 1}</td>
            <td>${record.nombre}</td>
            <td>${record.tiempo}</td>
            <td>${record.intentos}</td>
            <td>${record.tiempoRestante || "00:00"}</td>
            <td>${record.nivel}</td>
        </tr>`;
    });
    
    tablaJugadoresBody.innerHTML = html;
}

// Función para mostrar récords
function mostrarRecords() {
    let records = JSON.parse(localStorage.getItem('records') || '[]');
    
    if (records.length === 0) {
        listaRecords.innerHTML = '<p>Aún no hay récords registrados.</p>';
        return;
    }
    
    let html = '<table class="tabla-records">';
    html += '<tr><th>Nombre</th><th>Nivel</th><th>Intentos</th><th>Tiempo</th><th>Fecha</th></tr>';
    
    records.forEach(record => {
        html += `<tr>
            <td>${record.nombre}</td>
            <td>${record.nivel}</td>
            <td>${record.intentos}</td>
            <td>${record.tiempo}</td>
            <td>${record.fecha}</td>
        </tr>`;
    });
    
    html += '</table>';
    listaRecords.innerHTML = html;
}

// Función para restablecer el juego
function restablecer() {
    nivel = 1;
    prepararJuego();
}

// Función para mostrar mensajes
function mostrarMensaje(texto) {
    mensajeTexto.textContent = texto;
    mensaje.classList.remove('oculto');
}

// Función para mezclar un array (algoritmo Fisher-Yates)
function mezclarArray(array) {
    let currentIndex = array.length;
    let randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si hay un nombre guardado
    const nombreGuardado = localStorage.getItem('nombreJugador');
    if (nombreGuardado) {
        nombreJugador = nombreGuardado;
        nombreDisplay.textContent = nombreJugador;
        pantallaInicial.classList.add('oculto');
        pantallaJuego.classList.remove('oculto');
        prepararJuego();
    }
    
    // Precargar todas las imágenes para evitar problemas de carga
    imagenes.forEach(src => {
        const img = new Image();
        img.src = src;
    });
    
    // Mostrar la tabla de jugadores registrados
    mostrarTablaJugadores();
});
