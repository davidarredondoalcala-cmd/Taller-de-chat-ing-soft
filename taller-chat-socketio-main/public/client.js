// ============================================================
//  TALLER: Chat en tiempo real con Socket.IO
//  ARCHIVO: public/client.js
// ============================================================

const socket = io();

// ------------------------------------------------------------
// Elementos del DOM
// ------------------------------------------------------------
const login = document.getElementById('login');
const chat = document.getElementById('chat');
const formLogin = document.getElementById('form-login');
const inputNombre = document.getElementById('input-nombre');
const miNombreDisplay = document.getElementById('mi-nombre-display');

const formMensaje = document.getElementById('form-mensaje');
const inputMensaje = document.getElementById('input-mensaje');
const mensajes = document.getElementById('mensajes');
const listaUsuarios = document.getElementById('lista-usuarios');
const contadorUsuarios = document.getElementById('contador-usuarios');
const escribiendo = document.getElementById('escribiendo');

let miNombre = '';
let listaUsuariosActual = [];

// ------------------------------------------------------------
// 1. Entrar al chat
// ------------------------------------------------------------
formLogin.addEventListener('submit', (e) => {
  e.preventDefault();
  miNombre = inputNombre.value.trim();
  if (!miNombre) return;

  socket.emit('entrar', miNombre);

  login.classList.add('oculto');
  chat.classList.remove('oculto');
  miNombreDisplay.textContent = `${miNombre} (Tú)`;
  inputMensaje.focus();
});

// ------------------------------------------------------------
// 2. Enviar mensajes de texto
// ------------------------------------------------------------
formMensaje.addEventListener('submit', (e) => {
  e.preventDefault();
  const texto = inputMensaje.value.trim();
  if (!texto) return;

  socket.emit('mensaje', texto);
  inputMensaje.value = '';
});

// ------------------------------------------------------------
// 5. Avisar que estoy escribiendo
// ------------------------------------------------------------
inputMensaje.addEventListener('input', () => {
  socket.emit('escribiendo');
});

// ------------------------------------------------------------
// 6. Recibir del Servidor (Mensajes y Conectados)
// ------------------------------------------------------------
socket.on('mensaje', (data) => {
  pintarMensaje(data);
});

socket.on('sistema', (texto) => {
  pintarSistema(texto);
});

socket.on('usuarios', (usuarios) => {
  listaUsuariosActual = usuarios;
  listaUsuarios.innerHTML = '';
  contadorUsuarios.textContent = `(${usuarios.length})`;

  usuarios.forEach((user) => {
    const li = document.createElement('li');
    const esPropio = user.id === socket.id;

    const infoDiv = document.createElement('div');
    infoDiv.className = 'user-item-info';

    const dot = document.createElement('span');
    dot.className = 'user-dot';
    infoDiv.appendChild(dot);

    const nameSpan = document.createElement('span');
    nameSpan.className = 'user-name-text';
    nameSpan.textContent = esPropio ? `${user.nombre} (Tú)` : user.nombre;
    infoDiv.appendChild(nameSpan);

    li.appendChild(infoDiv);

    listaUsuarios.appendChild(li);
  });
});

let timeoutEscribiendo = null;
socket.on('escribiendo', (nombre) => {
  escribiendo.textContent = `${nombre} está escribiendo...`;
  clearTimeout(timeoutEscribiendo);
  timeoutEscribiendo = setTimeout(() => {
    escribiendo.textContent = '';
  }, 1500);
});

// ------------------------------------------------------------
// 7. Helpers de Renderizado de Mensajes
// ------------------------------------------------------------
function pintarMensaje({ autor, texto, hora }) {
  const li = document.createElement('li');
  const esPropio = autor === miNombre;
  li.className = esPropio ? 'mensaje propio' : 'mensaje';

  li.innerHTML = `
    <span class="autor"></span>
    <span class="texto"></span>
    <time></time>
  `;
  li.querySelector('.texto').textContent = texto;
  li.querySelector('.autor').textContent = autor;
  li.querySelector('time').textContent = formatearHora(hora);
  mensajes.appendChild(li);
  mensajes.scrollTop = mensajes.scrollHeight;
}

function pintarSistema(texto) {
  const li = document.createElement('li');
  li.className = 'sistema';
  li.textContent = texto;
  mensajes.appendChild(li);
  mensajes.scrollTop = mensajes.scrollHeight;
}

function formatearHora(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit'
  });
}
