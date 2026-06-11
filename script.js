// ==========================================
// FASE 1: VARIABLES Y PINES DE INTERFAZ
// ==========================================
const inputRojo = document.getElementById('tiempo-rojo');
const inputAmarillo = document.getElementById('tiempo-amarillo');
const inputVerde = document.getElementById('tiempo-verde');
const botonEnviar = document.getElementById('enviar');

// ==========================================
// FASE 2: CONFIGURACIÓN DEL PROTOCOLO MQTT
// ==========================================
// Definimos los parámetros del servidor de Eclipse.
// Usamos el puerto 443 porque los navegadores modernos exigen conexiones seguras (SSL/WebSockets).
const broker = "mqtt.eclipseprojects.io";
const puerto = 443;

// El "Topic" es el canal de radio al que tu amigo deberá sintonizar el ESP32.
const topic = "proyecto/semaforo/tiempos";

// Generamos un ID de cliente aleatorio. Si dos dispositivos usan el mismo ID en el broker, 
// el servidor los desconecta por conflicto.
const clienteID = "interfazWeb_" + parseInt(Math.random() * 1000, 10);

// Instanciamos (creamos) el cliente MQTT usando la librería Paho que pusiste en el HTML.
const clienteMQTT = new Paho.MQTT.Client(broker, puerto, clienteID);

// Rutinas de aviso de conexión (como los LEDs de status en un módulo)
clienteMQTT.onConnectionLost = function(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("Conexión perdida: " + responseObject.errorMessage);
    }
};

// ==========================================
// FASE 3: RUTINA DE ARRANQUE (BOOT)
// ==========================================
// Le decimos al cliente que intente conectarse al broker apenas cargue el código.
console.log("Iniciando conexión con Eclipse...");
clienteMQTT.connect({
    useSSL: true, // Crucial para que el navegador no bloquee la conexión
    onSuccess: function() {
        console.log("¡Conexión MQTT establecida con éxito!");
        // Aquí podrías habilitar el botón solo si hay conexión, por seguridad.
    },
    onFailure: function(fallo) {
        console.log("Error al conectar: " + fallo.errorMessage);
    }
});

// ==========================================
// FASE 4: INTERRUPCIÓN DE BOTÓN (TRANSMISIÓN DE DATOS)
// ==========================================
botonEnviar.addEventListener('click', function() {
    
    // 1. Lectura de variables enteras
    let tiempoR = parseInt(inputRojo.value);
    let tiempoA = parseInt(inputAmarillo.value);
    let tiempoV = parseInt(inputVerde.value);

    // 2. Validación de seguridad (Antirrebotes lógico)
    if (isNaN(tiempoR) || isNaN(tiempoA) || isNaN(tiempoV)) {
        alert("Por favor, ingresa los tres tiempos antes de enviar.");
        return; 
    }

    // 3. Estructuración en memoria
    const datosSemaforo = {
        rojo: tiempoR,
        amarillo: tiempoA,
        verde: tiempoV
    };

    // 4. Codificación del Payload (JSON)
    const tramaJSON = JSON.stringify(datosSemaforo);
    
    // Mostramos en consola local por motivos de depuración
    console.log("Preparando TX de datos:", tramaJSON);

    // 5. Rutina de Envío por MQTT
    // Solo permitimos el envío si el módulo logró conectarse a Eclipse previamente.
    if (clienteMQTT.isConnected()) {
        // Creamos el mensaje con la trama JSON
        let mensaje = new Paho.MQTT.Message(tramaJSON);
        // Le asignamos la ruta de destino (el topic)
        mensaje.destinationName = topic;
        // Ejecutamos la orden de disparo (TX)
        clienteMQTT.send(mensaje);
        console.log("¡Mensaje publicado en el Topic: " + topic + "!");
        alert("Datos enviados con éxito al ESP32");
    } else {
        alert("Error: No hay conexión con el servidor MQTT. Revisa tu internet.");
    }
});