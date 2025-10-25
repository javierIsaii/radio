document.body.classList.add('no-scroll');
var logo = document.querySelector('.icono');
var loader = document.querySelector('.loader');
var splashScreen = document.getElementById('splash-screen');
var aviso = document.getElementById('error-message')
var nota = document.querySelector('.nota');
var timeoutId;
var pageLoaded = false;
var barraCarga = document.getElementById('barra-de-carga')
var progreso = document.getElementById('progreso');

document.addEventListener('DOMContentLoaded', function () {
  let maxLoadTime = 3000;
  let timeoutId = setTimeout(function () {
  }, maxLoadTime);
});

window.addEventListener('load', function () {
  loader.style.opacity = 1;
  nota.style.opacity = 1;
  aviso.style.opacity = 1;
  setTimeout(function () {
    aviso.style.opacity = 0;
    aviso.style.transition = 'opacity 0.4s ease-in-out';
    nota.style.opacity = 0;
    nota.style.transition = "opacity 0.2s";
  }, 1800);
  setTimeout(function () {
    splashScreen.style.opacity = 0;
    clearTimeout(timeoutId);
    pageLoaded = true;
    setTimeout(function () {
      splashScreen.style.display = 'none';
    }, 1000);
  }, 2000); // Duración del splash

  setTimeout(function () {
    document.body.classList.remove('no-scroll'); //Delay scroll
  }, 2600);
});
