document.addEventListener("DOMContentLoaded", () => {
    const audio = document.getElementById("audio-player");
    if (!audio) return;

    const titulo = document.getElementById("current-title");
    const artista = document.getElementById("current-artist");
    const cola = document.getElementById("queue-list");
    const historial = document.getElementById("history-list");
    const colaContador = document.getElementById("queue-count");
    const historialContador = document.getElementById("history-count");

    const token = document.querySelector(
        'input[name="__RequestVerificationToken"]'
    )?.value;

    let reproduciendo = false;

    function dibujarLista(elemento, canciones) {
        if (!elemento) return;

        elemento.replaceChildren();

        canciones.forEach(cancion => {
            const li = document.createElement("li");
            const nombre = document.createElement("span");
            const autor = document.createElement("small");

            nombre.textContent = cancion.titulo;
            autor.textContent = cancion.artista;

            li.append(nombre, autor);
            elemento.appendChild(li);
        });
    }

    function actualizarContadores(estado) {
        if (colaContador) {
            colaContador.textContent = estado.cola.length;
        }

        if (historialContador) {
            historialContador.textContent = estado.historial.length;
        }

        const mensajeCola = document.querySelector(".queue-empty");
        const mensajeHistorial = document.querySelector(".history-empty");

        if (mensajeCola) {
            mensajeCola.hidden = estado.cola.length > 0;
        }

        if (mensajeHistorial) {
            mensajeHistorial.hidden = estado.historial.length > 0;
        }
    }

    function actualizarEstado(estado, reproducirAudio) {
        const cancion = estado.actual;

        if (cancion) {
            titulo.textContent = cancion.titulo;
            artista.textContent = cancion.artista;

            if (audio.dataset.currentSrc !== cancion.archivo) {
                audio.src = cancion.archivo;
                audio.dataset.currentSrc = cancion.archivo;
            }

            if (reproducirAudio) {
                audio.play().catch(error => {
                    console.warn("No se pudo iniciar el audio:", error);
                });
            }
        }

        dibujarLista(cola, estado.cola);
        dibujarLista(historial, estado.historial);
        actualizarContadores(estado);
    }

    async function enviarFormulario(formulario, reproducirAudio) {
        if (!token) {
            console.error("No se encontró el token de seguridad.");
            return;
        }

        const datos = new FormData(formulario);

        try {
            const respuesta = await fetch(formulario.action, {
                method: "POST",
                body: datos,
                headers: { "X-Requested-With": "XMLHttpRequest" }
            });

            if (!respuesta.ok) {
                throw new Error(`Error HTTP ${respuesta.status}`);
            }

            const estado = await respuesta.json();
            actualizarEstado(estado, reproducirAudio);
        } catch (error) {
            console.error("Error de reproducción:", error);
        }
    }

    document.querySelectorAll(
        'form[action*="AgregarAColaApi"], ' +
        'form[action*="ReproducirApi"], ' +
        'form[action*="SiguienteApi"], ' +
        'form[action*="AnteriorApi"]'
    ).forEach(formulario => {
        formulario.addEventListener("submit", evento => {
            evento.preventDefault();

            const esAnterior = formulario.action.includes("AnteriorApi");
            const reproducir = esAnterior ||
                formulario.action.includes("SiguienteApi") ||
                formulario.action.includes("ReproducirApi");

            enviarFormulario(formulario, reproducir);
        });
    });

    audio.addEventListener("play", () => {
        reproduciendo = true;
    });

    audio.addEventListener("pause", () => {
        reproduciendo = false;
    });

    audio.addEventListener("ended", () => {
        const formulario = document.querySelector(
            'form[action*="SiguienteApi"]'
        );

        if (formulario) {
            enviarFormulario(formulario, true);
        }
    });

    const actual = document.getElementById("current-audio");

    if (actual?.dataset.src) {
        audio.src = actual.dataset.src;
        audio.dataset.currentSrc = actual.dataset.src;
    }
});

/* Controles personalizados del reproductor inferior */
document.addEventListener("DOMContentLoaded", () => {
    const audio = document.getElementById("audio-player");
    const boton = document.getElementById("play-pause-button");
    const barra = document.getElementById("progress-bar");
    const tiempoActual = document.getElementById("current-time");
    const duracionTotal = document.getElementById("duration-time");

    if (!audio || !boton || !barra) return;

    function formatoTiempo(segundos) {
        if (!Number.isFinite(segundos) || segundos < 0) return "0:00";

        const minutos = Math.floor(segundos / 60);
        const segundosRestantes = Math.floor(segundos % 60);

        return `${minutos}:${String(segundosRestantes).padStart(2, "0")}`;
    }

    function actualizarBoton() {
        const reproduciendo = !audio.paused && !audio.ended;

        boton.textContent = reproduciendo ? "Ⅱ" : "▶";
        boton.setAttribute(
            "aria-label",
            reproduciendo ? "Pausar" : "Reproducir"
        );
        boton.setAttribute(
            "title",
            reproduciendo ? "Pausar" : "Reproducir"
        );
    }

    function actualizarProgreso() {
        const duracion = audio.duration;
        const actual = audio.currentTime || 0;

        tiempoActual.textContent = formatoTiempo(actual);

        if (Number.isFinite(duracion) && duracion > 0) {
            barra.value = String(Math.round((actual / duracion) * 1000));
            duracionTotal.textContent = formatoTiempo(duracion);
        } else {
            barra.value = "0";
            duracionTotal.textContent = "0:00";
        }

        const porcentaje = Number(barra.value) / 10;
        barra.style.setProperty("--progress", `${porcentaje}%`);
    }

    boton.addEventListener("click", async () => {
        if (!audio.src) {
            const siguiente = document.querySelector(
                'form[action*="SiguienteApi"]'
            );

            if (siguiente) siguiente.requestSubmit();
            return;
        }

        if (audio.paused) {
            try {
                await audio.play();
            } catch (error) {
                console.warn("No se pudo reproducir la canción:", error);
            }
        } else {
            audio.pause();
        }
    });

    barra.addEventListener("input", () => {
        const duracion = audio.duration;

        if (Number.isFinite(duracion) && duracion > 0) {
            audio.currentTime = (Number(barra.value) / 1000) * duracion;
            actualizarProgreso();
        }
    });

    audio.addEventListener("loadedmetadata", actualizarProgreso);
    audio.addEventListener("durationchange", actualizarProgreso);
    audio.addEventListener("timeupdate", actualizarProgreso);
    audio.addEventListener("play", actualizarBoton);
    audio.addEventListener("pause", actualizarBoton);
    audio.addEventListener("ended", () => {
        actualizarBoton();
        actualizarProgreso();
    });

    actualizarBoton();
    actualizarProgreso();
});

// Cargar la canción seleccionada por el servidor al abrir la página.
document.addEventListener("DOMContentLoaded", () => {
    const audio = document.getElementById("audio-player");
    if (!audio) return;

    const rutaInicial = audio.dataset.initialSrc;

    if (rutaInicial && rutaInicial.trim()) {
        audio.src = rutaInicial;
        audio.load();
    }
});

// ===== MUSICLAB_AUDIO_VISUALIZER =====
document.addEventListener("DOMContentLoaded", () => {
    const audio = document.getElementById("audio-player");
    const barrasContenedor = document.getElementById("audio-visualizer");
    const portada = document.getElementById("visualizer-cover");
    const tituloDock = document.getElementById("current-title");
    const artistaDock = document.getElementById("current-artist");
    const tituloPanel = document.getElementById("visualizer-title");
    const artistaPanel = document.getElementById("visualizer-artist");
    const estadoPanel = document.getElementById("visualizer-status-text");
    const panel = document.getElementById("now-playing-sidebar");

    if (!audio || !barrasContenedor || !panel) return;

    const cantidadBarras = 48;
    const barras = [];

    for (let i = 0; i < cantidadBarras; i++) {
        const barra = document.createElement("span");
        barra.className = "spectrum-bar";
        barra.style.height = "3px";
        barrasContenedor.appendChild(barra);
        barras.push(barra);
    }

    let contextoAudio = null;
    let analizador = null;
    let fuenteAudio = null;
    let datosFrecuencia = null;
    let animacionActiva = false;
    let ultimoFrame = 0;

    function actualizarPortada() {
        const titulo = tituloDock?.textContent?.trim() || "";
        const artista = artistaDock?.textContent?.trim() || "";

        if (tituloPanel) {
            tituloPanel.textContent = titulo || "Selecciona una canción";
            tituloPanel.title = titulo;
        }

        if (artistaPanel) {
            artistaPanel.textContent = artista || "Tu biblioteca local";
            artistaPanel.title = artista;
        }

// MUSICLAB_DYNAMIC_BAR_COLORS
        if (titulo && artista) {
            const clave = titulo + "|" + artista;
            let hash = 0;

            for (let i = 0; i < clave.length; i++) {
                hash = (hash * 31 + clave.charCodeAt(i)) | 0;
            }

            const tono = (Math.abs(hash) % 360);
            const tonoSecundario = (tono + 55) % 360;

            barrasContenedor.style.setProperty(
                "--cover-color",
                `hsl(${tono}, 95%, 68%)`
            );

            barrasContenedor.style.setProperty(
                "--cover-color-secondary",
                `hsl(${tonoSecundario}, 90%, 55%)`
            );
        }
        if (portada && titulo && artista) {
            const url = "/Home/Portada?titulo=" +
                encodeURIComponent(titulo) +
                "&artista=" + encodeURIComponent(artista);

            if (portada.getAttribute("src") !== url) {
                portada.src = url;
            }
        }
    }

    function prepararAudio() {
        if (analizador) return true;

        try {
            const AudioContextClase =
                window.AudioContext || window.webkitAudioContext;

            if (!AudioContextClase) {
                if (estadoPanel) estadoPanel.textContent = "VISUALIZADOR NO DISPONIBLE";
                return false;
            }

            contextoAudio = new AudioContextClase();
            analizador = contextoAudio.createAnalyser();
            analizador.fftSize = 256;
            analizador.smoothingTimeConstant = 0.78;

            fuenteAudio = contextoAudio.createMediaElementSource(audio);
            fuenteAudio.connect(analizador);
            analizador.connect(contextoAudio.destination);

            datosFrecuencia = new Uint8Array(analizador.frequencyBinCount);
            return true;
        } catch (error) {
            console.warn("No se pudo inicializar el visualizador:", error);
            if (estadoPanel) estadoPanel.textContent = "AUDIO EN REPRODUCCIÓN";
            return false;
        }
    }

    function dibujarEspectro(marcaTiempo) {
        if (!animacionActiva) return;

        requestAnimationFrame(dibujarEspectro);

        if (marcaTiempo - ultimoFrame < 35) return;
        ultimoFrame = marcaTiempo;

        if (analizador && !audio.paused) {
            analizador.getByteFrequencyData(datosFrecuencia);
        }

        for (let i = 0; i < barras.length; i++) {
            let intensidad = 0;

            if (analizador && !audio.paused) {
                const indice = Math.min(
                    datosFrecuencia.length - 1,
                    Math.floor(Math.pow(i / barras.length, 1.35) *
                    datosFrecuencia.length)
                );

                intensidad = datosFrecuencia[indice] / 255;
            }

            const altura = audio.paused
                ? 3
                : Math.max(3, Math.pow(intensidad, 0.8) * 105);

            barras[i].style.height = `${altura}px`;
            barras[i].style.opacity = audio.paused
                ? "0.35"
                : String(0.45 + intensidad * 0.55);
        }
    }

    function iniciarAnimacion() {
        if (animacionActiva) return;
        animacionActiva = true;
        requestAnimationFrame(dibujarEspectro);
    }

    audio.addEventListener("play", async () => {
        actualizarPortada();

        const listo = prepararAudio();

        if (listo && contextoAudio?.state === "suspended") {
            try {
                await contextoAudio.resume();
            } catch (error) {
                console.warn("No se pudo activar el analizador:", error);
            }
        }

        if (estadoPanel) estadoPanel.textContent = "ANALIZANDO AUDIO EN VIVO";
        iniciarAnimacion();
    });

    audio.addEventListener("pause", () => {
        if (estadoPanel) estadoPanel.textContent = "REPRODUCCIÓN EN PAUSA";
    });

    audio.addEventListener("ended", () => {
        if (estadoPanel) estadoPanel.textContent = "CANCIÓN FINALIZADA";
    });

    audio.addEventListener("loadedmetadata", actualizarPortada);

    if (tituloDock && artistaDock) {
        const observador = new MutationObserver(actualizarPortada);
        observador.observe(tituloDock, { childList: true, subtree: true, characterData: true });
        observador.observe(artistaDock, { childList: true, subtree: true, characterData: true });
    }

    actualizarPortada();

    if (!audio.paused) {
        prepararAudio();
        if (contextoAudio?.state === "running") iniciarAnimacion();
    } else if (estadoPanel) {
        estadoPanel.textContent = "LISTO PARA REPRODUCIR";
    }
});