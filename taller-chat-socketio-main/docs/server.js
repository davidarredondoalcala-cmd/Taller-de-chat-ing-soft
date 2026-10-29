// ============================================================
//  TALLER: Chat en tiempo real con Socket.IO
//  ARCHIVO: server.js
// ============================================================

require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  maxHttpBufferSize: 1e8 // 100 MB buffer
});

// ------------------------------------------------------------
// Middleware y archivos estáticos
// ------------------------------------------------------------
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ------------------------------------------------------------
// Usuarios conectados: Map(socket.id -> nombre)
// ------------------------------------------------------------
const usuarios = new Map();

function obtenerListaUsuarios() {
  return Array.from(usuarios.entries()).map(([id, nombre]) => ({ id, nombre }));
}

// ------------------------------------------------------------
// Lógica de Socket.IO
// ------------------------------------------------------------
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  // 1. Entrar al chat
  socket.on('entrar', (nombre) => {
    const nombreLimpio = String(nombre).trim() || 'Anónimo';
    usuarios.set(socket.id, nombreLimpio);

    // Notificar a todos sobre el nuevo usuario
    io.emit('sistema', `${nombreLimpio} se unió al chat`);
    io.emit('usuarios', obtenerListaUsuarios());
  });

  // 2. Mensajes de texto
  socket.on('mensaje', (texto) => {
    const autor = usuarios.get(socket.id) || 'Anónimo';
    const hora = new Date().toISOString();

    // Transmitir a todos los clientes
    io.emit('mensaje', { autor, texto: String(texto), hora });
  });

  // 3. Indicador de escritura
  socket.on('escribiendo', () => {
    const autor = usuarios.get(socket.id);
    if (autor) {
      socket.broadcast.emit('escribiendo', autor);
    }
  });

  // 5. Desconexión
  socket.on('disconnect', () => {
    const nombre = usuarios.get(socket.id);
    if (nombre) {
      usuarios.delete(socket.id);
      io.emit('sistema', `${nombre} salió del chat`);
      io.emit('usuarios', obtenerListaUsuarios());
    }
    console.log('Cliente desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});
