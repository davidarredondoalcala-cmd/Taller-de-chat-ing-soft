// ============================================================
//  TALLER: Chat en tiempo real con Socket.IO, MongoDB,
//  Stickers, Archivos y Video/Audio llamadas WebRTC
//  ARCHIVO: server.js
// ============================================================

require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const multer = require('multer');

// Usar DNS de respaldo si la red local tiene problemas con registros SRV de MongoDB Atlas
const dns = require('node:dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignorar si no se permite
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  maxHttpBufferSize: 1e8 // 100 MB buffer
});

// ------------------------------------------------------------
// Configuración de Subida de Archivos con Multer
// ------------------------------------------------------------
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${Date.now()}_${base}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB
});

// Middleware y archivos estáticos
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadDir));

// Endpoint HTTP para subir archivos
app.post('/api/upload', upload.single('archivo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    url: fileUrl,
    fileName: req.file.originalname,
    fileType: req.file.mimetype,
    fileSize: req.file.size
  });
});

// ------------------------------------------------------------
// Conexión y Esquema de MongoDB
// ------------------------------------------------------------
const mensajeSchema = new mongoose.Schema({
  autor: { type: String, required: true },
  texto: { type: String, default: '' },
  tipo: { type: String, enum: ['texto', 'sticker', 'archivo'], default: 'texto' },
  fileUrl: { type: String, default: null },
  fileName: { type: String, default: null },
  fileType: { type: String, default: null },
  fileSize: { type: Number, default: null },
  stickerUrl: { type: String, default: null },
  hora: { type: Date, default: Date.now }
});
const Mensaje = mongoose.model('Mensaje', mensajeSchema);

let mongoConectado = false;
const fallbackMensajes = [];

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chat_socketio';

mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    mongoConectado = true;
    console.log('✅ Conexión exitosa a MongoDB');
  })
  .catch((err) => {
    mongoConectado = false;
    console.warn('⚠️ No se pudo conectar a MongoDB Atlas:', err.message);
    console.warn('ℹ️ El chat operará con almacenamiento en memoria mientras se verifica la IP en Atlas.');
  });

async function guardarMensaje(data) {
  const doc = {
    autor: data.autor,
    texto: data.texto || '',
    tipo: data.tipo || 'texto',
    fileUrl: data.fileUrl || null,
    fileName: data.fileName || null,
    fileType: data.fileType || null,
    fileSize: data.fileSize || null,
    stickerUrl: data.stickerUrl || null,
    hora: data.hora || new Date()
  };

  if (mongoConectado) {
    try {
      await Mensaje.create(doc);
      return;
    } catch (err) {
      console.error('Error al guardar en MongoDB:', err.message);
    }
  }

  // Respaldo en memoria si MongoDB no está disponible
  fallbackMensajes.push(doc);
  if (fallbackMensajes.length > 200) fallbackMensajes.shift();
}

async function obtenerHistorial() {
  if (mongoConectado) {
    try {
      const msgs = await Mensaje.find().sort({ hora: -1 }).limit(50).lean();
      return msgs.reverse();
    } catch (err) {
      console.error('Error leyendo de MongoDB:', err.message);
    }
  }
  return fallbackMensajes;
}

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
  socket.on('entrar', async (nombre) => {
    const nombreLimpio = String(nombre).trim() || 'Anónimo';
    usuarios.set(socket.id, nombreLimpio);

    // Enviar historial de mensajes previos desde MongoDB
    const historial = await obtenerHistorial();
    socket.emit('historial', historial);

    // Notificar a todos sobre el nuevo usuario
    io.emit('sistema', `${nombreLimpio} se unió al chat`);
    io.emit('usuarios', obtenerListaUsuarios());
  });

  // 2. Mensajes (texto, sticker o archivo)
  socket.on('mensaje', async (payload) => {
    const autor = usuarios.get(socket.id) || 'Anónimo';
    const hora = new Date().toISOString();

    let dataMensaje;
    if (typeof payload === 'string') {
      dataMensaje = { autor, texto: payload, tipo: 'texto', hora };
    } else {
      dataMensaje = {
        autor,
        texto: payload.texto || '',
        tipo: payload.tipo || 'texto',
        fileUrl: payload.fileUrl || null,
        fileName: payload.fileName || null,
        fileType: payload.fileType || null,
        fileSize: payload.fileSize || null,
        stickerUrl: payload.stickerUrl || null,
        hora
      };
    }

    // Guardar en la base de datos MongoDB
    await guardarMensaje(dataMensaje);

    // Transmitir a todos los clientes
    io.emit('mensaje', dataMensaje);
  });

  // 3. Indicador de escritura
  socket.on('escribiendo', () => {
    const autor = usuarios.get(socket.id);
    if (autor) {
      socket.broadcast.emit('escribiendo', autor);
    }
  });

  // ----------------------------------------------------------
  // 4. Señalización WebRTC para llamadas y videollamadas
  // ----------------------------------------------------------
  socket.on('llamar-usuario', ({ destinoId, offer, tipoLlamada }) => {
    const emisorNombre = usuarios.get(socket.id) || 'Alguien';
    io.to(destinoId).emit('llamada-entrante', {
      emisorId: socket.id,
      emisorNombre,
      offer,
      tipoLlamada // 'video' | 'audio'
    });
  });

  socket.on('aceptar-llamada', ({ destinoId, answer }) => {
    io.to(destinoId).emit('llamada-aceptada', {
      emisorId: socket.id,
      answer
    });
  });

  socket.on('rechazar-llamada', ({ destinoId }) => {
    const emisorNombre = usuarios.get(socket.id) || 'Alguien';
    io.to(destinoId).emit('llamada-rechazada', {
      emisorId: socket.id,
      emisorNombre
    });
  });

  socket.on('candidato-ice', ({ destinoId, candidate }) => {
    io.to(destinoId).emit('candidato-ice', {
      emisorId: socket.id,
      candidate
    });
  });

  socket.on('colgar-llamada', ({ destinoId }) => {
    io.to(destinoId).emit('llamada-terminada', {
      emisorId: socket.id
    });
  });

  // 5. Desconexión
  socket.on('disconnect', () => {
    const nombre = usuarios.get(socket.id);
    if (nombre) {
      usuarios.delete(socket.id);
      io.emit('sistema', `${nombre} salió del chat`);
      io.emit('usuarios', obtenerListaUsuarios());
      // Si estaba en llamada, notificar a los demás para colgar
      socket.broadcast.emit('llamada-terminada', { emisorId: socket.id });
    }
    console.log('Cliente desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});
