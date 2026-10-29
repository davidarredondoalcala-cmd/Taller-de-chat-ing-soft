<!--
  ╔════════════════════════════════════════════════════════════════╗
  ║  PLANTILLA DE ENTREGA — Taller de chat con Socket.IO           ║
  ╠════════════════════════════════════════════════════════════════╣
  ║  1. Renombra este archivo a README.md (reemplaza el que viene  ║
  ║     con el taller: ese es el enunciado, no tu entrega).        ║
  ║  2. Llena TODO lo que diga [...] y borra los comentarios como  ║
  ║     este, que van entre <!-- y -->                             ║
  ║  3. Marca con [x] lo que hiciste. No marques lo que no sirve:  ║
  ║     se revisa corriendo el código.                             ║
  ╚════════════════════════════════════════════════════════════════╝
-->

# Chat en tiempo real con Socket.IO

**Estudiante:** [Tu nombre completo]
**Código:** [Tu código]
**Materia / grupo:** [...]
**Fecha de entrega:** [DD/MM/AAAA]
**Repositorio:** [pega aquí el link de tu repo de GitHub]

---

## 1. Cómo correr el proyecto

<!-- Escríbelo como si quien lo lee nunca hubiera visto tu proyecto. -->

```bash
git clone [url de tu repo]
cd [nombre de la carpeta]
npm install
npm start
```

Luego abre `http://localhost:3000` en **dos ventanas** del navegador
(una en modo incógnito) para chatear contigo mismo.

**Versión de Node usada:** [por ejemplo v20.11.0 — sale con `node -v`]

---

## 2. Eventos de Socket.IO que implementé

<!--
  Llena una fila por cada evento. Esta tabla es lo primero que se revisa:
  si está bien hecha, se nota que entendiste el flujo.
  En "Quién lo recibe" responde con precisión: ¿todos? ¿todos menos yo? ¿solo yo?
-->

| Evento | Lo emite | Lo escucha | Qué datos lleva | Quién lo recibe |
|---|---|---|---|---|
| `entrar` | Cliente | Servidor | `nombre` (string) | Solo el servidor |
| `sistema` | Servidor | Cliente | `texto` (string) | Todos (`io.emit`) |
| `mensaje` | ... | ... | ... | ... |
| `usuarios` | ... | ... | ... | ... |
| `escribiendo` | ... | ... | ... | ... |
| ... | ... | ... | ... | ... |

---

## 3. Retos obligatorios

<!-- Marca [x] solo lo que realmente funciona. -->

- [ ] **Reto 1** — Entrar con un nombre y avisar al resto
- [ ] **Reto 2** — Mandar y recibir mensajes en tiempo real
- [ ] **Reto 3** — Lista de conectados que se actualiza
- [ ] **Reto 4** — Indicador "está escribiendo"
- [ ] **Reto 5** — Desconexión limpia (sale de la lista y avisa)

**¿Algo quedó a medias o no funciona?** Dilo aquí, con honestidad.
Un reto incompleto bien explicado vale más que uno marcado en falso:

[...]

---

## 4. Retos extra que hice

<!-- Si no hiciste ninguno, escribe "Ninguno" y borra la tabla. -->

| Reto extra | ¿Cómo lo resolví? |
|---|---|
| [por ejemplo: Historial de los últimos 20 mensajes] | [Guardé un array en el servidor y se lo mando con `socket.emit` solo a quien entra] |
| ... | ... |

---

## 5. Capturas

<!--
  Sube las imágenes a una carpeta /capturas en tu repo y enlázalas así.
  Obligatoria: al menos una con DOS o más usuarios chateando y
  la lista de conectados visible.
-->

![Dos usuarios chateando](capturas/chat.png)

![Lista de conectados](capturas/usuarios.png)

---

## 6. Lo que más me costó

<!-- Dos o tres frases. Qué se te atravesó y cómo saliste de ahí. -->

[...]

---

## 7. Preguntas de sustentación

<!-- Responde con tus palabras. Si copias y pegas se nota. -->

**1. ¿En qué se diferencian `socket.emit`, `socket.broadcast.emit` e `io.emit`?**

[...]

**2. ¿Por qué el servidor no puede confiar en el nombre que manda el cliente?**

[...]

**3. ¿Qué pasa con el `Map` de usuarios si el servidor se reinicia? ¿Cómo lo arreglarías?**

[...]

**4. ¿Qué es el "fallback a long-polling" y cuándo entra en acción?**

[...]

**5. Si hubiera 10.000 usuarios, ¿por qué `io.emit` en cada tecla presionada sería un problema?**

[...]

---

## 8. Antes de entregar — revisa esto

<!-- Checklist. Si algo queda sin marcar, pierdes puntos de a gratis. -->

- [ ] `node_modules/` **no** está en el repo (revisa tu `.gitignore`)
- [ ] El repo es **público** y el link de arriba abre
- [ ] Tengo **6 commits o más**, con mensajes que dicen qué hice
      (no "cambios", "update", "asd")
- [ ] Clonando el repo en limpio, `npm install && npm start` funciona
- [ ] Las capturas se ven en GitHub (no son links rotos)
- [ ] Llené todos los `[...]` de este archivo
- [ ] Borré los comentarios de la plantilla

---

## Fuentes y ayuda

<!--
  Si usaste documentación, tutoriales, un compañero o una IA, dilo aquí.
  Usarlas no baja la nota; no declararlas, sí.
  Pero tienes que poder explicar en la sustentación cada línea de tu código.
-->

- [Documentación oficial de Socket.IO](https://socket.io/docs/v4/)
- [...]
