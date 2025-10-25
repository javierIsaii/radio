// Reproductor de radio funcional
        class RadioPlayer {
            constructor() {
                this.audio = new Audio();
                this.audio.crossOrigin = "anonymous";
                this.audio.src =
                    "https://cast2.my-control-panel.com/proxy/radioroc/stream";

                // Configuración para prevenir pausas automáticas
                this.audio.preload = "auto";
                this.audio.autoplay = false;

                this.isPlaying = false;
                this.isMuted = false;
                this.volume = 80; // 0-100 scale
                this.isOnline = true;
                this.userWantsToPlay = false; // Bandera clave: solo el usuario decide

                this.initializeElements();
                this.setupEventListeners();
                this.setVolume(this.volume);
                this.checkStreamStatus();
                this.preventAutoPause();
            }

            initializeElements() {
                this.playButton = document.getElementById("play");
                this.shareButton = document.getElementById("share-btn");
                this.volumeToggle = document.getElementById("volume-toggle");
                this.volumeSlider = document.getElementById("volume-slider");
                this.volumeLevel = document.querySelector(".volume-level-indicator");
                this.statusIndicator = document.getElementById("status-indicator");
                this.statusText = document.querySelector(".status-text");
                this.livePulse = document.querySelector(".live-pulse");
                this.liveText = document.querySelector(".live-text");
                this.nowPlaying = document.getElementById("now-playing");
                this.statusTextElement = document.getElementById("status-text");
                this.gradient = document.querySelector(".playerGradient");
            }

            // SOLUCIÓN DEFINITIVA: Prevenir TODAS las pausas automáticas
            preventAutoPause() {
                // 1. Mantener reproducción cuando cambia visibilidad
                document.addEventListener("visibilitychange", () => {
                    if (!document.hidden && this.userWantsToPlay) {
                        // Página visible de nuevo, reanudar si el usuario quería reproducir
                        setTimeout(() => {
                            if (!this.isPlaying && this.userWantsToPlay) {
                                this.audio.play().catch((err) => {
                                    console.log("Reintentando reproducción:", err);
                                });
                            }
                        }, 100);
                    }
                });

                // 2. Interceptar pausas NO causadas por el usuario
                this.audio.addEventListener("pause", () => {
                    // Si el usuario quiere reproducir pero el audio se pausó, reanudar
                    if (this.userWantsToPlay && !this.isManualPause) {
                        console.log("Pausa automática detectada, reanudando...");
                        setTimeout(() => {
                            this.audio.play().catch((err) => {
                                console.log("Error al reanudar:", err);
                            });
                        }, 50);
                    }
                });

                // 3. Interceptar eventos de "suspend" (cuando el navegador pausa por ahorro)
                this.audio.addEventListener("suspend", () => {
                    if (this.userWantsToPlay) {
                        console.log("Navegador intentó suspender, reanudando...");
                        this.audio.load();
                        setTimeout(() => {
                            if (this.userWantsToPlay) {
                                this.audio.play().catch((err) => console.log("Error:", err));
                            }
                        }, 100);
                    }
                });

                // 4. Mantener activo cuando pierde foco
                window.addEventListener("blur", () => {
                    if (this.userWantsToPlay && !this.audio.paused) {
                        // Guardar estado pero no hacer nada, dejar reproduciendo
                        console.log("Ventana perdió foco, manteniendo reproducción...");
                    }
                });

                // 5. Reanudar cuando recupera foco
                window.addEventListener("focus", () => {
                    if (this.userWantsToPlay && this.audio.paused) {
                        console.log("Ventana recuperó foco, reanudando...");
                        this.audio.play().catch((err) => console.log("Error:", err));
                    }
                });

                // 6. Prevenir que el navegador detenga por "inactividad"
                setInterval(() => {
                    if (this.userWantsToPlay && this.audio.paused) {
                        console.log("Verificando estado, reanudando si es necesario...");
                        this.audio.play().catch((err) => {
                            // Silenciar errores de reproducción automática
                        });
                    }
                }, 2000); // Verificar cada 2 segundos
            }

            setupEventListeners() {
                // Botón de play/pause
                this.playButton.addEventListener("click", () => {
                    this.togglePlay();
                });

                // Botón de compartir
                this.shareButton.addEventListener("click", () => {
                    this.shareRadio();
                });

                // Botón de mute/unmute
                this.volumeToggle.addEventListener("click", () => {
                    this.toggleMute();
                });

                // Control de volumen
                this.volumeSlider.addEventListener("input", (e) => {
                    this.setVolume(parseInt(e.target.value));
                });

                // Eventos del audio
                this.audio.addEventListener("play", () => {
                    this.setPlayingState(true);
                    this.statusTextElement.textContent = "Transmitiendo";
                });

                this.audio.addEventListener("pause", () => {
                    this.setPlayingState(false);
                    this.statusTextElement.textContent = "En pausa";
                });

                this.audio.addEventListener("error", (e) => {
                    console.error("Error en el reproductor:", e);
                    this.setPlayingState(false);
                    this.statusTextElement.textContent = "Error de conexión";
                    this.statusTextElement.style.color = "#ff2c56";
                    this.setOfflineStatus();
                });

                // Verificar estado del stream periódicamente
                setInterval(() => {
                    this.checkStreamStatus();
                }, 30000); // Cada 30 segundos
            }

            togglePlay() {
                if (this.isPlaying) {
                    this.pause();
                } else {
                    this.play();
                }

                // Animación del botón
                this.playButton.style.transform = " translateX(-50%) scale(0.95)";
                setTimeout(() => {
                    this.playButton.style.transform = "translateX(-50%) scale(1)";
                }, 150);
            }

            play() {
                this.audio
                    .play()
                    .then(() => {
                        this.isPlaying = true;
                        this.setPlayingState(true);
                        this.statusTextElement.textContent = "Transmitiendo";
                        this.statusTextElement.style.color = "var(--onlineText)";
                        this.statusTextElement.style.textShadow =
                            "0px 0px 25px var(--onlineTextShadow)";
                        this.gradient.classList.add("show");
                        this.setOnlineStatus();
                    })
                    .catch((error) => {
                        console.error("Error al reproducir:", error);
                        this.isPlaying = false;
                        this.setPlayingState(false);
                        this.statusTextElement.textContent = "Error de conexión";
                        this.statusTextElement.style.color = "#ff2c56";
                        this.statusTextElement.style.textShadow =
                            "0px 0px 25px rgb(255, 255, 255, 0)";
                        this.gradient.classList.remove("show");
                        this.setOfflineStatus();
                    });
            }

            pause() {
                this.audio.pause();
                this.isPlaying = false;
                this.setPlayingState(false);
                this.statusTextElement.textContent = "En pausa";
                this.statusTextElement.style.color = "#b4794b";
                this.statusTextElement.style.textShadow =
                    "0px 0px 25px rgb(255, 255, 255, 0)";
                this.gradient.classList.remove("show");
            }

            toggleMute() {
                this.isMuted = !this.isMuted;

                // Si está muteado, guardar el volumen anterior y poner a 0
                if (this.isMuted) {
                    this.previousVolume = this.volume;
                    this.setVolume(0);
                } else {
                    // Restaurar el volumen anterior
                    this.setVolume(this.previousVolume || 5);
                }

                // Actualizar icono de volumen
                this.updateVolumeIcon();

                // Animación del botón
                this.volumeToggle.style.transform = "scale(0.97)";
                setTimeout(() => {
                    this.volumeToggle.style.transform = "scale(1)";
                }, 200);
            }

            setVolume(level) {
                this.volume = level;
                this.audio.volume = level / 100;

                // Actualizar slider y indicador
                this.volumeSlider.value = level;
                this.volumeLevel.textContent = level;

                // Actualizar icono de volumen
                this.updateVolumeIcon();

                // Actualizar variable CSS para el volumen
                document.documentElement.style.setProperty("--volume", `${level}%`);

                // Si el volumen es 0, activar mute visualmente
                if (level === 0 && !this.isMuted) {
                    this.isMuted = true;
                    this.updateVolumeIcon();
                } else if (level > 0 && this.isMuted) {
                    this.isMuted = false;
                    this.updateVolumeIcon();
                }
            }

            updateVolumeIcon() {
                let iconClass = "fas fa-volume-";

                if (this.isMuted || this.volume === 0) {
                    iconClass += "mute";
                } else if (this.volume < 4) {
                    iconClass += "down";
                } else {
                    iconClass += "up";
                }

                this.volumeToggle.innerHTML = `<i class="${iconClass}"></i>`;
            }

            shareRadio() {
                if (navigator.share) {
                    navigator
                        .share({
                            title: "Radio Rocola 103.7 FM",
                            text: "Escucha Radio Rocola 103.7 FM en vivo",
                            url: window.location.href,
                        })
                        .catch((error) => {
                            console.log("Error al compartir:", error);
                        });
                } else {
                    // Fallback para navegadores que no soportan Web Share API
                    alert(
                        "Comparte Radio Rocola 103.7 FM con tus amigos: " +
                        window.location.href
                    );
                }

                // Animación del botón
                this.shareButton.style.transform = "scale(0.9)";
                setTimeout(() => {
                    this.shareButton.style.transform = "scale(1)";
                }, 200);
            }

            setPlayingState(playing) {
                this.isPlaying = playing;
                if (playing) {
                    this.playButton.innerHTML = '<i class="fas fa-pause"></i>';
                    this.playButton.setAttribute("aria-label", "Pausar");
                } else {
                    this.playButton.innerHTML = '<i class="fas fa-play"></i>';
                    this.playButton.setAttribute("aria-label", "Reproducir");
                }
            }

            checkStreamStatus() {
                // Simular verificación de estado del stream
                // En una implementación real, aquí harías una petición para verificar el estado
                const isOnline = Math.random() > 0.1; // 90% de probabilidad de estar online

                if (isOnline) {
                    this.setOnlineStatus();
                } else {
                    this.setOfflineStatus();
                }
            }

            setOnlineStatus() {
                this.isOnline = true;
                this.statusIndicator.classList.remove("offline");
                this.liveText.textContent = "En vivo";
                this.livePulse.style.animation = "pulse 2s infinite ease-out";
                this.livePulse.style.backgroundColor = "white";
            }

            setOfflineStatus() {
                this.isOnline = false;
                this.statusIndicator.classList.add("offline");
                this.liveText.textContent = "Offline";
                this.livePulse.style.animation = "none";
                this.livePulse.style.backgroundColor = "#ccc";

                // Si estaba reproduciendo, pausar
                if (this.isPlaying) {
                    this.pause();
                }
            }
        }

        // Inicializar el reproductor cuando la página cargue
        document.addEventListener("DOMContentLoaded", () => {
            window.radioPlayer = new RadioPlayer();

            // Mejorar la compatibilidad con dispositivos táctiles
            document.addEventListener("touchstart", function () { }, true);
        });

        // Efectos de hover para elementos interactivos
        const interactiveElements = document.querySelectorAll(
            "button, a, .schedule-item, .team-member"
        );
        interactiveElements.forEach((element) => {
            element.addEventListener("mouseenter", () => {
                element.style.transition =
                    "transform 0.2s ease, background-color 0.3s ease, color 0.3s ease";
            });
        });