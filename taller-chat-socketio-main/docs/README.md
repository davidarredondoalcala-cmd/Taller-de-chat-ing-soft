# Taller: Chat en tiempo real con WebSockets y Socket.IO

**Duración estimada:** 2 a 3 horas
**Prerrequisitos:** HTML, CSS y JavaScript básico. Node.js 18 o superior instalado.
**Entrega:** repositorio de GitHub con el chat funcionando + capturas.

> **Guía visual con la animación del flujo:** https://juanbonilla1305.github.io/taller-chat-socketio/

---

## 1. ¿Por qué WebSockets?

Con HTTP normal, el navegador **pregunta** y el servidor **responde**. El servidor
nunca puede hablar primero. Para un chat eso es un problema: si Ana escribe,
el navegador de Luis no se entera hasta que vuelva a preguntar.

| | HTTP | WebSocket |
|---|---|---|
| Quién inicia | Siempre el cliente | Cualquiera de los dos |
| Conexión | Se abre y se cierra en cada petición | Queda abierta |
| Latencia | Alta para tiempo real | Baja (milisegundos) |
| Uso típico | Cargar una página, un formulario | Chat, notificaciones, juegos, dashboards |

Un WebSocket nace como una petición HTTP normal que pide un **upgrade** de protocolo.
Si el servidor acepta, ese mismo socket TCP queda abierto en ambas direcciones.

### ¿Y Socket.IO qué es?

Socket.IO es una **librería encima** de WebSocket. Usa WebSocket cuando puede y,
si la red lo bloquea, se cae de vuelta a HTTP long-polling sin que te enteres.
Además te regala cosas que WebSocket puro no trae:

- **Eventos con nombre**: `socket.emit('mensaje', ...)` en vez de mandar texto plano.
- **Reconexión automática** cuando se cae la red.
- **Salas (rooms)** para agrupar usuarios.
- **Broadcast**: mandarle a todos, o a todos menos a uno.

---

## 2. Los 5 conceptos que necesitas

```js
// SERVIDOR
io.on('connection', (socket) => { ... })  // alguien entró; socket = ESE cliente
socket.on('evento', (data) => { ... })    // escuchar a ESE cliente
socket.emit('evento', data)               // mandarle solo a ESE cliente
socket.broadcast.emit('evento', data)     // a todos MENOS a ese cliente
io.emit('evento', data)                   // a TODOS los conectados
```

```js
// CLIENTE
const socket = io();                      // abre la conexión
socket.emit('evento', data)               // mandar al servidor
socket.on('evento', (data) => { ... })    // escuchar al servidor
```

Eso es todo. El resto del taller es aplicar estas 5 líneas.

### Flujo de un mensaje

```
Ana escribe "hola"
   │
   │  socket.emit('mensaje', 'hola')
   ▼
SERVIDOR  ── socket.on('mensaje') ──► agrega autor y hora
   │
   │  io.emit('mensaje', { autor:'Ana', texto:'hola', hora:'...' })
   ▼
Ana, Luis, Pedro  ── socket.on('mensaje') ──► lo pintan en pantalla
```

**Regla de oro:** el cliente manda solo el **texto**. El **autor** lo pone el servidor.
Si confías en el autor que manda el cliente, cualquiera puede escribir haciéndose
pasar por otro desde la consola del navegador.

---

## 3. Montar el proyecto

```bash
cd taller-chat-socketio
npm install
npm run dev
```

Abre **dos ventanas** del navegador en `http://localhost:3000` (una de ellas en
modo incógnito) para probar el chat entre dos "personas".

> `npm run dev` usa `node --watch`: reinicia el servidor solo cuando guardas.

### Qué hay en cada archivo

```
taller-chat-socketio/
├── package.json
├── PLANTILLA-README.md  ← la llenas y la entregas como tu README.md
├── server.js            ← backend: Express + Socket.IO   (TODO 1 a 4)
└── public/
    ├── index.html       ← ya está hecho, no hay que tocarlo
    ├── styles.css       ← ya está hecho
    └── client.js        ← frontend: tu lógica            (TODO 1 a 7)
```

El `<script src="/socket.io/socket.io.js">` del HTML **no es un archivo tuyo**:
Socket.IO lo sirve automáticamente cuando lo montas sobre el servidor HTTP.

---

## 4. Los retos (parte obligatoria)

Cada TODO está marcado en el código. Hazlos **en orden** y prueba después de cada uno.

### Reto 1 — Entrar con un nombre
- **Cliente:** al enviar el formulario de login, `socket.emit('entrar', miNombre)`.
- **Servidor:** escucha `'entrar'`, guarda el nombre en el `Map` usando `socket.id`
  como llave, y avisa a todos con `io.emit('sistema', ...)`.

✅ **Prueba:** abre dos ventanas; al entrar la segunda, en la primera debe aparecer
"Luis se unió al chat".

### Reto 2 — Mandar y recibir mensajes
- **Cliente:** `socket.emit('mensaje', texto)` al enviar el formulario.
- **Servidor:** escucha `'mensaje'`, arma `{ autor, texto, hora }` y lo reenvía
  con `io.emit('mensaje', ...)`.
- **Cliente:** `socket.on('mensaje', pintarMensaje)`.

✅ **Prueba:** escribe desde una ventana, aparece en las dos al instante.

### Reto 3 — Lista de conectados
- **Servidor:** cada vez que alguien entra o sale, `io.emit('usuarios', [...usuarios.values()])`.
- **Cliente:** escucha `'usuarios'` y repinta el `<ul id="lista-usuarios">`.

### Reto 4 — "Fulano está escribiendo..."
- **Cliente:** en el evento `input` del campo de texto, `socket.emit('escribiendo')`.
- **Servidor:** reenvía con `socket.broadcast.emit('escribiendo', nombre)`.
  👉 Aquí **no** sirve `io.emit`: te verías a ti mismo escribiendo.
- **Cliente:** muestra el texto y bórralo con un `setTimeout` de 1.5 segundos.

### Reto 5 — Salir bien
- **Servidor:** en `socket.on('disconnect')`, borra el usuario del `Map`,
  avisa por `'sistema'` y manda la lista actualizada.

✅ **Prueba:** cierra una ventana; en la otra debe desaparecer de la lista.

---

## 5. Retos extra (para subir nota)

| # | Reto | Pista |
|---|---|---|
| 1 | No dejar entrar con un nombre ya usado | Revisa el `Map` antes de guardar; responde `socket.emit('error-nombre')` |
| 2 | Historial: al entrar, ver los últimos 20 mensajes | Guarda un array en el servidor y mándalo con `socket.emit` (solo a quien entra) |
| 3 | Salas por tema (#general, #random) | `socket.join('general')` y `io.to('general').emit(...)` |
| 4 | Mensajes privados | `io.to(socketIdDestino).emit('privado', ...)` |
| 5 | Confirmación de entrega | Callbacks de Socket.IO: `socket.emit('mensaje', texto, (ok) => ...)` |
| 6 | Avatares con iniciales y color por usuario | Hash del nombre a color HSL |
| 7 | Desplegar en Render o Railway | El puerto debe salir de `process.env.PORT` |

---

## 6. Trampas típicas (léelas antes de pedir ayuda)

1. **`io is not defined` en el navegador** → falta el `<script src="/socket.io/socket.io.js">`,
   o lo pusiste **después** de `client.js`.
2. **El mensaje llega dos veces** → registraste `socket.on('mensaje', ...)` dentro
   de otro listener, así que se registra de nuevo en cada evento. Los `socket.on`
   del cliente van **una sola vez**, en el nivel superior del archivo.
3. **Me veo a mí mismo "escribiendo"** → usaste `io.emit` en vez de `socket.broadcast.emit`.
4. **Funciona en mi PC pero no entre dos computadores** → el cliente apunta a
   `localhost`. Usa `io()` sin argumentos (toma el host de la página) y entra por la IP de red.
5. **Se me quedan usuarios fantasma en la lista** → no implementaste `disconnect`,
   o borraste del `Map` por nombre en vez de por `socket.id`.
6. **`EADDRINUSE`** → ya tienes un servidor corriendo en el 3000. Ciérralo o cambia el puerto.
7. **Inyección de HTML** → si pintas con `innerHTML = texto`, un compañero puede
   mandar una etiqueta maliciosa. Por eso los helpers usan `textContent`.

---

## 7. Qué entregar

1. Repositorio de GitHub público con el código (sin `node_modules`, usa `.gitignore`).
2. Tu propio `README.md`: **usa el archivo `PLANTILLA-README.md`** que viene en el
   proyecto. Renómbralo a `README.md` (reemplazando este enunciado) y llénalo.
   Tiene la tabla de eventos, las preguntas de sustentación y un checklist final.
3. Captura de pantalla con **dos o más** usuarios chateando.
4. Mínimo **6 commits** con mensajes descriptivos (uno por reto, aproximadamente).

---

## 8. Rúbrica (100 puntos)

| Criterio | Puntos |
|---|---|
| Reto 1 — Entrar con nombre + aviso de sistema | 15 |
| Reto 2 — Mensajes en tiempo real entre varios clientes | 25 |
| Reto 3 — Lista de conectados actualizada | 15 |
| Reto 4 — Indicador "está escribiendo" con broadcast correcto | 10 |
| Reto 5 — Desconexión limpia | 10 |
| El autor del mensaje lo define el servidor (no el cliente) | 10 |
| Commits, README propio y repo ordenado | 10 |
| Al menos un reto extra funcionando | 5 |

---

## 9. Preguntas para sustentar

Responde en tu README; pueden preguntártelas en la sustentación.

1. ¿En qué se diferencia `socket.emit`, `socket.broadcast.emit` e `io.emit`?
2. ¿Por qué el servidor no puede confiar en el nombre que manda el cliente?
3. ¿Qué pasa con el `Map` de usuarios si el servidor se reinicia? ¿Cómo lo arreglarías?
4. ¿Qué es el "fallback a long-polling" y cuándo entra en acción?
5. Si hubiera 10.000 usuarios, ¿por qué `io.emit` en cada tecla presionada sería un problema?
