// Diccionarios simples
const emojiMap = {
    "Felicidad": "😊",
    "Enojo": "😡",
    "Enojado": "😡",
    "Sorpresa": "😮",
    "Tristeza": "😢",
    "No identificado": "❓",
    "Sin rostro": "🔍"
};

const colorEmocionMap = {
    "Felicidad": "#22c55e",
    "Enojo": "#ef4444",
    "Enojado": "#ef4444",
    "Sorpresa": "#eab308",
    "Tristeza": "#3b82f6",
    "No identificado": "#94a3b8",
    "Sin rostro": "#cbd5e1"
};

// Referencias HTML sencillas
const p1 = document.getElementById("pantalla-1");
const p2 = document.getElementById("pantalla-2");
const p3 = document.getElementById("pantalla-3");
const p4 = document.getElementById("pantalla-4");

const streamVideo = document.getElementById("stream-video");
const contenedorCamara = document.getElementById("contenedor-camara");
const panelVivo = document.getElementById("panel-vivo");

const btnInicio = document.getElementById("btn-inicio");
const btnIniciarPrueba = document.getElementById("btn-iniciar-prueba");
const btnVolverP2 = document.getElementById("btn-volver-p2");
const btnVolverP3 = document.getElementById("btn-volver-p3");
const btnVerResultados = document.getElementById("btn-ver-resultados");
const btnTerminar = document.getElementById("btn-terminar");

let socket = null;
let emocionesGuardadas = [];
let temporizador = null;
let tiempo = 10;
let resultadoFinal = "No identificado";

// Función básica para ocultar/mostrar pantallas
function irAPantalla(pantallaMostrar) {
    p1.classList.remove("activa");
    p2.classList.remove("activa");
    p3.classList.remove("activa");
    p4.classList.remove("activa");
    
    pantallaMostrar.classList.add("activa");
}

// Botones de navegación
btnInicio.addEventListener("click", function() { irAPantalla(p2); });
btnVolverP2.addEventListener("click", function() { apagarPrueba(); irAPantalla(p1); });
btnVolverP3.addEventListener("click", function() { irAPantalla(p2); });

btnTerminar.addEventListener("click", function() {
    apagarPrueba();
    irAPantalla(p1);
});

btnVerResultados.addEventListener("click", function() {
    document.getElementById("emocion-predominante").textContent = resultadoFinal;
    document.getElementById("emoji-resultado").textContent = emojiMap[resultadoFinal] || "😐";
    irAPantalla(p4);
});

// Iniciar Prueba de 10 segundos
btnIniciarPrueba.addEventListener("click", function() {
    emocionesGuardadas = [];
    tiempo = 10;
    document.getElementById("contador-tiempo").textContent = tiempo;
    
    contenedorCamara.classList.remove("oculto");
    btnIniciarPrueba.disabled = true;
    
    // Conectar cámara y websocket
    streamVideo.src = "/video_feed";
    socket = new WebSocket("ws://" + window.location.host + "/ws/emotions");

    socket.onmessage = function(event) {
        let datos = JSON.parse(event.data);
        if (datos.emotion) {
            emocionesGuardadas.push(datos.emotion);
            
            // Actualizar vista lateral
            document.getElementById("emocion-viva").textContent = datos.emotion;
            document.getElementById("emoji-vivo").textContent = emojiMap[datos.emotion] || "😐";
            
            // Cambiar color del borde en vivo
            let color = colorEmocionMap[datos.emotion] || "#cbd5e1";
            panelVivo.style.borderColor = color;
        }
    };

    // Conteo de 10 segundos con setInterval básico
    temporizador = setInterval(function() {
        tiempo--;
        document.getElementById("contador-tiempo").textContent = tiempo;

        if (tiempo <= 0) {
            finalizarPrueba();
        }
    }, 1000);
});

function apagarPrueba() {
    if (temporizador) clearInterval(temporizador);
    if (socket) socket.close();
    
    streamVideo.removeAttribute("src");
    contenedorCamara.classList.add("oculto");
    btnIniciarPrueba.disabled = false;
}

function finalizarPrueba() {
    apagarPrueba();
    
    // Calcular la emoción que más se repitió usando for básico
    let conteo = {};
    let max = 0;
    let masFrecuente = "No identificado";

    for (let i = 0; i < emocionesGuardadas.length; i++) {
        let emo = emocionesGuardadas[i];
        if (emo !== "Sin rostro" && emo !== "No identificado") {
            if (!conteo[emo]) {
                conteo[emo] = 1;
            } else {
                conteo[emo]++;
            }

            if (conteo[emo] > max) {
                max = conteo[emo];
                masFrecuente = emo;
            }
        }
    }

    resultadoFinal = masFrecuente;
    irAPantalla(p3);
}