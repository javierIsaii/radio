// Toggle de tema claro/oscuro
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Comprobar si hay una preferencia guardada
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    body.classList.add(savedTheme);
} else {
    // Por defecto, modo oscuro
    body.classList.add('dark-mode');
}

// Comprobar preferencia del sistema
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
if (!savedTheme && prefersDarkScheme.matches) {
    body.classList.add('dark-mode');
}

themeToggle.addEventListener('click', () => {
    // Transición más rápida (0.3s definido en CSS)
    if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark-mode');
    } else {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        localStorage.setItem('theme', 'light-mode');
    }
    
    // Pequeña animación en el botón
    themeToggle.style.transform = 'scale(0.95)';
    setTimeout(() => {
        themeToggle.style.transform = 'scale(1)';
    }, 150);
});

// Reproductor de radio funcional
class RadioPlayer {
    constructor() {
        this.audio = new Audio();
        this.audio.crossOrigin = "anonymous";
        this.audio.src = "https://cast2.my-control-panel.com/proxy/radioroc/stream";
        
        this.isPlaying = false;
        this.isMuted = false;
        this.volume = 80; // 0-100 scale
        this.isOnline = true;
        
        this.initializeElements();
        this.setupEventListeners();
        this.setVolume(this.volume);
        this.checkStreamStatus();
    }
    
    initializeElements() {
        this.playButton = document.getElementById('play');
        this.shareButton = document.getElementById('share-btn');
        this.volumeToggle = document.getElementById('volume-toggle');
        this.volumeSlider = document.getElementById('volume-slider');
        this.volumeLevel = document.querySelector('.volume-level-indicator');
        this.statusIndicator = document.getElementById('status-indicator');
        this.statusText = document.querySelector('.status-text');
        this.livePulse = document.querySelector('.live-pulse');
        this.liveText = document.querySelector('.live-text');
        this.nowPlaying = document.getElementById('now-playing');
        this.statusTextElement = document.getElementById('status-text');
    }
    
    setupEventListeners() {
        // Botón de play/pause
        this.playButton.addEventListener('click', () => {
            this.togglePlay();
        });
        
        // Botón de compartir
        this.shareButton.addEventListener('click', () => {
            this.shareRadio();
        });
        
        // Botón de mute/unmute
        this.volumeToggle.addEventListener('click', () => {
            this.toggleMute();
        });
        
        // Control de volumen
        this.volumeSlider.addEventListener('input', (e) => {
            this.setVolume(parseInt(e.target.value));
        });
        
        // Eventos del audio
        this.audio.addEventListener('play', () => {
            this.setPlayingState(true);
            this.statusTextElement.textContent = 'Transmitiendo';
        });
        
        this.audio.addEventListener('pause', () => {
            this.setPlayingState(false);
            this.statusTextElement.textContent = 'En pausa';
        });
        
        this.audio.addEventListener('error', (e) => {
            console.error('Error en el reproductor:', e);
            this.setPlayingState(false);
            this.statusTextElement.textContent = 'Error de conexión';
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
        this.playButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.playButton.style.transform = 'scale(1)';
        }, 150);
    }
    
    play() {
        this.audio.play()
            .then(() => {
                this.isPlaying = true;
                this.setPlayingState(true);
                this.statusTextElement.textContent = 'Transmitiendo';
                this.setOnlineStatus();
            })
            .catch(error => {
                console.error('Error al reproducir:', error);
                this.isPlaying = false;
                this.setPlayingState(false);
                this.statusTextElement.textContent = 'Error de conexión';
                this.setOfflineStatus();
            });
    }
    
    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.setPlayingState(false);
        this.statusTextElement.textContent = 'En pausa';
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
        this.volumeToggle.style.transform = 'scale(0.97)';
        setTimeout(() => {
            this.volumeToggle.style.transform = 'scale(1)';
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
        document.documentElement.style.setProperty('--volume', `${level}%`);
        
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
        let iconClass = 'fas fa-volume-';
        
        if (this.isMuted || this.volume === 0) {
            iconClass += 'mute';
        } else if (this.volume < 4) {
            iconClass += 'down';
        } else {
            iconClass += 'up';
        }
        
        this.volumeToggle.innerHTML = `<i class="${iconClass}"></i>`;
    }
    
    shareRadio() {
        if (navigator.share) {
            navigator.share({
                title: 'Radio Rocola 103.7 FM',
                text: 'Escucha Radio Rocola 103.7 FM en vivo',
                url: window.location.href
            })
            .catch(error => {
                console.log('Error al compartir:', error);
            });
        } else {
            // Fallback para navegadores que no soportan Web Share API
            alert('Comparte Radio Rocola 103.7 FM con tus amigos: ' + window.location.href);
        }
        
        // Animación del botón
        this.shareButton.style.transform = 'scale(0.9)';
        setTimeout(() => {
            this.shareButton.style.transform = 'scale(1)';
        }, 200);
    }
    
    setPlayingState(playing) {
        this.isPlaying = playing;
        if (playing) {
            this.playButton.innerHTML = '<i class="fas fa-pause"></i>';
            this.playButton.setAttribute('aria-label', 'Pausar');
        } else {
            this.playButton.innerHTML = '<i class="fas fa-play"></i>';
            this.playButton.setAttribute('aria-label', 'Reproducir');
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
        this.statusIndicator.classList.remove('offline');
        this.liveText.textContent = 'En vivo';
        this.livePulse.style.animation = 'pulse 2s infinite ease-out';
        this.livePulse.style.backgroundColor = 'white';
    }
    
    setOfflineStatus() {
        this.isOnline = false;
        this.statusIndicator.classList.add('offline');
        this.liveText.textContent = 'Fuera del aire';
        this.livePulse.style.animation = 'none';
        this.livePulse.style.backgroundColor = '#ccc';
        
        // Si estaba reproduciendo, pausar
        if (this.isPlaying) {
            this.pause();
        }
    }
}

// Inicializar el reproductor cuando la página cargue
document.addEventListener('DOMContentLoaded', () => {
    window.radioPlayer = new RadioPlayer();
    
    // Mejorar la compatibilidad con dispositivos táctiles
    document.addEventListener('touchstart', function() {}, true);
});

// Efectos de hover para elementos interactivos
const interactiveElements = document.querySelectorAll('button, a, .schedule-item, .team-member');
interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
        element.style.transition = 'transform 0.2s ease, background-color 0.3s ease, color 0.3s ease';
    });
});
