// ============================================================
//  TALLER: Chat en tiempo real con Socket.IO, MongoDB,
//  Stickers, Archivos y Video/Audio llamadas WebRTC
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

// Archivos y Stickers
const btnAdjuntar = document.getElementById('btn-adjuntar');
const inputArchivo = document.getElementById('input-archivo');
const btnStickers = document.getElementById('btn-stickers');
const stickerDrawer = document.getElementById('sticker-drawer');
const btnCerrarStickers = document.getElementById('btn-cerrar-stickers');
const stickerGrid = document.getElementById('sticker-grid');

// Llamadas y Videollamadas WebRTC
const modalLlamadaEntrante = document.getElementById('modal-llamada-entrante');
const textoLlamante = document.getElementById('texto-llamante');
const tipoLlamadaEntrante = document.getElementById('tipo-llamada-entrante');
const btnAceptarLlamada = document.getElementById('btn-aceptar-llamada');
const btnRechazarLlamada = document.getElementById('btn-rechazar-llamada');

const panelVideollamada = document.getElementById('panel-videollamada');
const remoteVideo = document.getElementById('remote-video');
const localVideo = document.getElementById('local-video');
const callPeerName = document.getElementById('call-peer-name');
const callTimer = document.getElementById('call-timer');
const remoteAvatarPlaceholder = document.getElementById('remote-avatar-placeholder');
const remotePlaceholderName = document.getElementById('remote-placeholder-name');
const localAvatarPlaceholder = document.getElementById('local-avatar-placeholder');
const btnToggleMic = document.getElementById('btn-toggle-mic');
const btnToggleCam = document.getElementById('btn-toggle-cam');
const btnColgar = document.getElementById('btn-colgar');

let miNombre = '';
let listaUsuariosActual = [];

// ------------------------------------------------------------
// Colección de Stickers
// ------------------------------------------------------------
const STICKERS = [
  { id: 'cat-love', name: 'Gatito Amor', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcjhzOTdxdG9yNDF6Nmt4ZWF1dmE0MmEwc2N1a3RhOTBqdXo5dWhpbiZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/MDJ9IbxxvDUQM/giphy.gif' },
  { id: 'cat-party', name: 'Fiesta', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeWZqcjl0MWp4M2o5Z2g1cXN5dWptb2k4a2psZmg4a2Z6ZXpmMmxoYiZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/artj92V8o75VPL7AeQ/giphy.gif' },
  { id: 'thumbs-up', name: 'Bien hecho', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnY5aGhhMGRucGlndTJscXR2czd2dWJrcHppMThmdTlycGV4d3M0OSZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/111ebonMs90YLu/giphy.gif' },
  { id: 'fire', name: 'Fuego', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWc1bXFpd3c1bjB2NmNuZjhjaGpqdGhkcnIxbndrb2NuaWV4eThkciZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/yr7n0u3qzO9nG/giphy.gif' },
  { id: 'pepe-laugh', name: 'Risa', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNTZsdTVsZGNkM2xwa3B2M2xka2Zoa2VvaXFvY3l0ODhsa3FsaTZmZSZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/B0vFTrb0ZGDf2/giphy.gif' },
  { id: 'dance', name: 'Baile', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcjlqdHRpZnRlaWRndGpsbmk5NGl6Mnhvcmg4dGFoZ3RndmtuaDRmciZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/DhstvI455Y099E5NQJ/giphy.gif' },
  { id: 'mindblown', name: 'Explosión Mental', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ3kxaHkydm51aXR5NXRrMWJjbjR3ZnB4cmR5cnk3aDZldDhkOTc4OCZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/26ufdipQqU2lhNA4g/giphy.gif' },
  { id: 'crying', name: 'Llorando', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaG13aGQyNnF4czY1b3k3cHBmOTVyOGc0Z3B4OG9laGpiNDl5NmtxNiZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/d2lcHJTG5Tscg/giphy.gif' },
  { id: 'doge-cool', name: 'Doge Cool', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Zsd2JwbW5pYWRvdnp2b3B0dW03MW0zbXpwaTBzZjhpeGlsODZwaiZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/8vyqV93h6XgI0/giphy.gif' },
  { id: 'heart', name: 'Corazón', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMmZ1bjl6Znh4MmR4bzF4OHBocmYzbHQ1dmN4eG8wdG13aXlkbWJjbyZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/LpDmM2wSt6Hm5fHGJ2/giphy.gif' },
  { id: 'ok-hand', name: 'Perfecto', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3c5bTlnanZsdjhkZG5pNmUydnphMmN2cG9rbHVpdmlxdXlyM3A2aiZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/3o7abKhOpu0NwenH3O/giphy.gif' },
  { id: 'thinking', name: 'Pensando', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnJ2bzB2NWQzNDUwdmZscWF0cHFjajcxaGtrMXV1NXh4c3p2MDRoOCZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/3o7bu3XilJ5BOiSGic/giphy.gif' }
];

function cargarStickersEnDrawer() {
  stickerGrid.innerHTML = '';
  STICKERS.forEach((stk) => {
    const img = document.createElement('img');
    img.src = stk.url;
    img.alt = stk.name;
    img.title = stk.name;
    img.className = 'sticker-item';
    img.loading = 'lazy';
    img.addEventListener('click', () => {
      enviarSticker(stk.url, stk.name);
      stickerDrawer.classList.add('oculto');
    });
    stickerGrid.appendChild(img);
  });
}
cargarStickersEnDrawer();

btnStickers.addEventListener('click', () => {
  stickerDrawer.classList.toggle('oculto');
});

btnCerrarStickers.addEventListener('click', () => {
  stickerDrawer.classList.add('oculto');
});

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

  socket.emit('mensaje', { tipo: 'texto', texto });
  inputMensaje.value = '';
  stickerDrawer.classList.add('oculto');
});

// ------------------------------------------------------------
// 3. Enviar Stickers
// ------------------------------------------------------------
function enviarSticker(stickerUrl, stickerName) {
  socket.emit('mensaje', {
    tipo: 'sticker',
    stickerUrl,
    texto: stickerName
  });
}

// ------------------------------------------------------------
// 4. Subir y Enviar Archivos
// ------------------------------------------------------------
btnAdjuntar.addEventListener('click', () => {
  inputArchivo.click();
});

inputArchivo.addEventListener('change', async () => {
  const file = inputArchivo.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('archivo', file);

  pintarSistema(`Subiendo "${file.name}"...`);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Error al subir el archivo al servidor');
    }

    const data = await response.json();
    socket.emit('mensaje', {
      tipo: 'archivo',
      fileUrl: data.url,
      fileName: data.fileName,
      fileType: data.fileType,
      fileSize: data.fileSize,
      texto: data.fileName
    });
  } catch (err) {
    console.error(err);
    pintarSistema(`❌ No se pudo subir el archivo: ${err.message}`);
  } finally {
    inputArchivo.value = '';
  }
});

// ------------------------------------------------------------
// 5. Avisar que estoy escribiendo
// ------------------------------------------------------------
inputMensaje.addEventListener('input', () => {
  socket.emit('escribiendo');
});

// ------------------------------------------------------------
// 6. Recibir del Servidor (Historial, Mensajes y Conectados)
// ------------------------------------------------------------
socket.on('historial', (mensajesGuardados) => {
  mensajes.innerHTML = '';
  if (Array.isArray(mensajesGuardados)) {
    mensajesGuardados.forEach((msg) => pintarMensaje(msg));
  }
});

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

    // Botones de llamada solo para los otros usuarios
    if (!esPropio) {
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'user-call-actions';

      const btnAudio = document.createElement('button');
      btnAudio.type = 'button';
      btnAudio.className = 'btn-user-action';
      btnAudio.title = `Llamar a ${user.nombre}`;
      btnAudio.textContent = '📞';
      btnAudio.onclick = () => iniciarLlamada(user.id, user.nombre, 'audio');

      const btnVideo = document.createElement('button');
      btnVideo.type = 'button';
      btnVideo.className = 'btn-user-action';
      btnVideo.title = `Videollamada con ${user.nombre}`;
      btnVideo.textContent = '📹';
      btnVideo.onclick = () => iniciarLlamada(user.id, user.nombre, 'video');

      actionsDiv.appendChild(btnAudio);
      actionsDiv.appendChild(btnVideo);
      li.appendChild(actionsDiv);
    }

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
function pintarMensaje({ autor, texto, tipo = 'texto', fileUrl, fileName, fileType, fileSize, stickerUrl, hora }) {
  const li = document.createElement('li');
  const esPropio = autor === miNombre;
  li.className = esPropio ? 'mensaje propio' : 'mensaje';

  if (tipo === 'sticker' && stickerUrl) {
    li.classList.add('tipo-sticker');
    li.innerHTML = `
      <span class="autor"></span>
      <img src="${stickerUrl}" class="sticker-img" alt="${texto || 'Sticker'}" loading="lazy" />
      <time></time>
    `;
  } else if (tipo === 'archivo' && fileUrl) {
    const esImagen = fileType && fileType.startsWith('image/');
    if (esImagen) {
      li.innerHTML = `
        <span class="autor"></span>
        <a href="${fileUrl}" target="_blank" rel="noopener noreferrer">
          <img src="${fileUrl}" class="file-preview-img" alt="${fileName || 'Foto'}" loading="lazy" />
        </a>
        <time></time>
      `;
    } else {
      li.innerHTML = `
        <span class="autor"></span>
        <div class="file-card">
          <div class="file-icon">📄</div>
          <div class="file-info">
            <div class="file-name" title="${fileName}">${fileName}</div>
            <div class="file-size">${formatearTamano(fileSize)}</div>
          </div>
          <a href="${fileUrl}" download="${fileName}" class="file-download-btn">⬇️ Descargar</a>
        </div>
        <time></time>
      `;
    }
  } else {
    li.innerHTML = `
      <span class="autor"></span>
      <span class="texto"></span>
      <time></time>
    `;
    li.querySelector('.texto').textContent = texto;
  }

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

function formatearTamano(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ------------------------------------------------------------
// 8. LLAMADAS Y VIDEOLLAMADAS WEBRTC P2P
// ------------------------------------------------------------
const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

let peerConnection = null;
let localStream = null;
let remoteStream = null;
let llamadaActiva = null; // { destinoId, peerNombre, tipoLlamada, timerId, segundos }
let llamadaEntranteData = null; // Datos mientras suena la llamada

// Iniciar una llamada (Voz o Video)
async function iniciarLlamada(destinoId, destinoNombre, tipoLlamada) {
  if (llamadaActiva || peerConnection) {
    alert('Ya estás en una llamada activa.');
    return;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert(
      '⚠️ Tu navegador bloquea la cámara y el micrófono en conexiones HTTP con IP.\n\n' +
      'Solución en Chrome o Edge:\n' +
      '1. Abre una pestaña y ve a: chrome://flags (o edge://flags)\n' +
      '2. Busca: "Insecure origins treated as secure"\n' +
      '3. Cámbialo a "Enabled" y escribe: http://' + window.location.host + '\n' +
      '4. Haz clic en "Relaunch" (Reiniciar).'
    );
    return;
  }

  try {
    const isVideo = tipoLlamada === 'video';
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: isVideo ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false
    });

    localVideo.srcObject = localStream;
    if (!isVideo) {
      localAvatarPlaceholder.classList.remove('oculto');
    } else {
      localAvatarPlaceholder.classList.add('oculto');
    }

    abrirPanelLlamada(destinoNombre, tipoLlamada);
    callPeerName.textContent = `Llamando a ${destinoNombre}...`;

    peerConnection = new RTCPeerConnection(rtcConfig);

    // Agregar tracks locales
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    // Escuchar stream remoto
    remoteStream = new MediaStream();
    remoteVideo.srcObject = remoteStream;
    peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
      remoteAvatarPlaceholder.classList.add('oculto');
    };

    // Candidatos ICE
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('candidato-ice', {
          destinoId,
          candidate: event.candidate
        });
      }
    };

    // Crear oferta
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    llamadaActiva = {
      destinoId,
      peerNombre: destinoNombre,
      tipoLlamada,
      segundos: 0,
      timerId: null
    };

    socket.emit('llamar-usuario', {
      destinoId,
      offer,
      tipoLlamada
    });
  } catch (err) {
    console.error('Error al iniciar llamada:', err);
    alert(`No se pudo acceder a la cámara o micrófono: ${err.message}`);
    cerrarLlamadaLocal();
  }
}

// Recibir llamada entrante
socket.on('llamada-entrante', (data) => {
  if (llamadaActiva || peerConnection) {
    // Si ya está ocupado en otra llamada, rechazar
    socket.emit('rechazar-llamada', { destinoId: data.emisorId });
    return;
  }

  llamadaEntranteData = data;
  textoLlamante.textContent = `${data.emisorNombre} te está llamando`;
  tipoLlamadaEntrante.textContent = data.tipoLlamada === 'video' ? '📹 Videollamada entrante' : '📞 Llamada de voz entrante';
  modalLlamadaEntrante.classList.remove('oculto');
});

// Aceptar llamada
btnAceptarLlamada.addEventListener('click', async () => {
  if (!llamadaEntranteData) return;

  const data = llamadaEntranteData;
  modalLlamadaEntrante.classList.add('oculto');

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert(
      '⚠️ Tu navegador bloquea la cámara y el micrófono en conexiones HTTP con IP.\n\n' +
      'Solución en Chrome o Edge:\n' +
      '1. Abre una pestaña y ve a: chrome://flags (o edge://flags)\n' +
      '2. Busca: "Insecure origins treated as secure"\n' +
      '3. Cámbialo a "Enabled" y escribe: http://' + window.location.host + '\n' +
      '4. Haz clic en "Relaunch" (Reiniciar).'
    );
    socket.emit('rechazar-llamada', { destinoId: data.emisorId });
    llamadaEntranteData = null;
    return;
  }

  try {
    const isVideo = data.tipoLlamada === 'video';
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: isVideo ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false
    });

    localVideo.srcObject = localStream;
    if (!isVideo) {
      localAvatarPlaceholder.classList.remove('oculto');
    } else {
      localAvatarPlaceholder.classList.add('oculto');
    }

    abrirPanelLlamada(data.emisorNombre, data.tipoLlamada);

    peerConnection = new RTCPeerConnection(rtcConfig);

    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    remoteStream = new MediaStream();
    remoteVideo.srcObject = remoteStream;
    peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
      remoteAvatarPlaceholder.classList.add('oculto');
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('candidato-ice', {
          destinoId: data.emisorId,
          candidate: event.candidate
        });
      }
    };

    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    llamadaActiva = {
      destinoId: data.emisorId,
      peerNombre: data.emisorNombre,
      tipoLlamada: data.tipoLlamada,
      segundos: 0,
      timerId: null
    };

    iniciarContadorLlamada();

    socket.emit('aceptar-llamada', {
      destinoId: data.emisorId,
      answer
    });
  } catch (err) {
    console.error('Error al contestar llamada:', err);
    alert(`Error al acceder a medios: ${err.message}`);
    socket.emit('rechazar-llamada', { destinoId: data.emisorId });
    cerrarLlamadaLocal();
  } finally {
    llamadaEntranteData = null;
  }
});

// Rechazar llamada
btnRechazarLlamada.addEventListener('click', () => {
  if (llamadaEntranteData) {
    socket.emit('rechazar-llamada', { destinoId: llamadaEntranteData.emisorId });
    llamadaEntranteData = null;
  }
  modalLlamadaEntrante.classList.add('oculto');
});

// El receptor aceptó la llamada
socket.on('llamada-aceptada', async (data) => {
  if (!peerConnection || !llamadaActiva) return;
  try {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    callPeerName.textContent = `En llamada con ${llamadaActiva.peerNombre}`;
    iniciarContadorLlamada();
  } catch (err) {
    console.error('Error al procesar respuesta:', err);
  }
});

// El receptor rechazó la llamada
socket.on('llamada-rechazada', (data) => {
  alert(`${data.emisorNombre || 'El usuario'} rechazó la llamada.`);
  cerrarLlamadaLocal();
});

// Candidato ICE recibido
socket.on('candidato-ice', async (data) => {
  if (peerConnection && data.candidate) {
    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    } catch (err) {
      console.error('Error al agregar ICE candidate:', err);
    }
  }
});

// Llamada terminada por el otro usuario
socket.on('llamada-terminada', () => {
  pintarSistema('La llamada ha finalizado.');
  cerrarLlamadaLocal();
});

// Botón de Colgar
btnColgar.addEventListener('click', () => {
  if (llamadaActiva) {
    socket.emit('colgar-llamada', { destinoId: llamadaActiva.destinoId });
  }
  cerrarLlamadaLocal();
});

// Mute / Unmute Micrófono
btnToggleMic.addEventListener('click', () => {
  if (!localStream) return;
  const audioTrack = localStream.getAudioTracks()[0];
  if (audioTrack) {
    audioTrack.enabled = !audioTrack.enabled;
    btnToggleMic.textContent = audioTrack.enabled ? '🎙️' : '🔇';
    btnToggleMic.classList.toggle('btn-active-muted', !audioTrack.enabled);
  }
});

// On / Off Cámara
btnToggleCam.addEventListener('click', () => {
  if (!localStream) return;
  const videoTrack = localStream.getVideoTracks()[0];
  if (videoTrack) {
    videoTrack.enabled = !videoTrack.enabled;
    btnToggleCam.textContent = videoTrack.enabled ? '📷' : '🚫';
    btnToggleCam.classList.toggle('btn-active-muted', !videoTrack.enabled);
    localAvatarPlaceholder.classList.toggle('oculto', videoTrack.enabled);
  }
});

// UI de Llamada
function abrirPanelLlamada(nombre, tipo) {
  panelVideollamada.classList.remove('oculto');
  callPeerName.textContent = `Conectando con ${nombre}...`;
  callTimer.textContent = '00:00';
  if (tipo === 'audio') {
    remoteAvatarPlaceholder.classList.remove('oculto');
    remotePlaceholderName.textContent = `Llamada de voz con ${nombre}`;
  } else {
    remoteAvatarPlaceholder.classList.add('oculto');
  }
}

function iniciarContadorLlamada() {
  if (!llamadaActiva) return;
  if (llamadaActiva.timerId) clearInterval(llamadaActiva.timerId);
  llamadaActiva.segundos = 0;
  llamadaActiva.timerId = setInterval(() => {
    if (!llamadaActiva) return;
    llamadaActiva.segundos++;
    const mins = String(Math.floor(llamadaActiva.segundos / 60)).padStart(2, '0');
    const secs = String(llamadaActiva.segundos % 60).padStart(2, '0');
    callTimer.textContent = `${mins}:${secs}`;
  }, 1000);
}

function cerrarLlamadaLocal() {
  if (llamadaActiva && llamadaActiva.timerId) {
    clearInterval(llamadaActiva.timerId);
  }
  llamadaActiva = null;

  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
    localStream = null;
  }

  if (remoteStream) {
    remoteStream.getTracks().forEach((track) => track.stop());
    remoteStream = null;
  }

  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }

  localVideo.srcObject = null;
  remoteVideo.srcObject = null;
  panelVideollamada.classList.add('oculto');
  modalLlamadaEntrante.classList.add('oculto');
  llamadaEntranteData = null;
  btnToggleMic.textContent = '🎙️';
  btnToggleMic.classList.remove('btn-active-muted');
  btnToggleCam.textContent = '📷';
  btnToggleCam.classList.remove('btn-active-muted');
}
