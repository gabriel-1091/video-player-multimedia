"use strict";

// ------------------------------------------ 1 -> Implementare navigare prin playlist + trecere la clipul urmator <- 1 ------------------------------------------

let mainVideo = document.querySelector(".main-video video");
let title = document.querySelector(".main-video .title");
let lastPlayedIndex = 0;  // utimul videoclip redat

// Obtinere lista videoclipuri
function getPlaylist() {
  return document.querySelectorAll(".video-list .vid");
}

// Redare videoclip din playlist dupa index
function playVideo(index) {

  let listaVideoclipuri = getPlaylist();

  // Sterg clasa 'active' de la restul videoclipurilor, marchez doar videoclipul curent ca fiind activ
  listaVideoclipuri.forEach((vid) => vid.classList.remove("active"));
  listaVideoclipuri[index].classList.add("active");

  mainVideo.pause();

  // Actualizez sursa si titlul videoclipului principal cu cele ale clipului ales
  mainVideo.src = listaVideoclipuri[index].querySelector("video").src;
  title.innerHTML = listaVideoclipuri[index].querySelector(".title").textContent;

  // Actualizez index-ul ultimului video redat
  lastPlayedIndex = index;

  // Asteptam sa fie pregatit clipul inainte de redare
  mainVideo.addEventListener("canplay", function onCanPlay() {
    mainVideo.play();
    // scot acel event listener pentru a evita redarea multipla
    mainVideo.removeEventListener("canplay", onCanPlay);
  });

  playButton.textContent = "❚❚";
}

// Adaugare event listeners pt. toate clipurile -> click (play la apasare) si dragstart (folosit la reordonarea clipurilor din playlist)
function addEventListeners() {
  let listaVideoclipuri = getPlaylist();

  listaVideoclipuri.forEach((video, index) => {
    video.addEventListener("click", () => {
      playVideo(index);
    });

    video.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", index);
    });
  });

}

// Implementare feature AUTOPLAY prin tratarea evenimentului "ended"
mainVideo.addEventListener("ended", function () {

  let listaVideoclipuri = getPlaylist();
  lastPlayedIndex = (lastPlayedIndex + 1) % listaVideoclipuri.length;
  playVideo(lastPlayedIndex);
});

// --------------------------------------- 2 -> Adaugare videoclip nou in playlist prin buton cu file input <- 2 ---------------------------------------

const fileInput = document.getElementById("fileInput");
const addButton = document.getElementById("addButton");

// Deschidere fereastra file explorer la apasarea butonului (elementul file input este invizibil in pagina)
addButton.addEventListener("click", function () {
  fileInput.click();
});

// Functie pentru crearea unui nou element de tip video
function creareElementVideo(file) {

  const videoElement = document.createElement("div");
  videoElement.classList.add("vid");

  const newVideo = document.createElement("video");
  newVideo.src = URL.createObjectURL(file);
  newVideo.controls = false;

  const titlu = document.createElement("h3");
  titlu.classList.add("title");
  titlu.textContent = file.name;

  videoElement.appendChild(newVideo);
  videoElement.appendChild(titlu);

  // Leg noul element video la playlist
  document.querySelector(".video-list").appendChild(videoElement);

  return videoElement;
}

// Functie pentru integrarea clipului incarcat in playlist
function procesareVideoIncarcat() {

  const fisier = fileInput.files;
  if (fisier.length > 0) {

    // Creare video nou 
    const newVideo = creareElementVideo(fisier[0]);

    // Adaugare la finalul playlistului + redare 
    let listaVideoclipuri = getPlaylist();
    listaVideoclipuri.forEach((vid) => vid.classList.remove("active"));

    newVideo.classList.add("active");

    mainVideo.src = newVideo.querySelector("video").src;
    title.innerHTML = newVideo.querySelector(".title").textContent;
    lastPlayedIndex = Array.from(listaVideoclipuri).indexOf(newVideo);

    mainVideo.play();

    // Re-actualizare event listeners pt. toate clipurile -> click (play la apasare) si dragstart (folosit la reordonarea clipurilor din playlist)
    addEventListeners();

    // Afisare notificare succes
    notificareAdaugare();

    newVideo.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", lastPlayedIndex);
    });
  }
}

// Declansarea functiei procesareVideoIncarcat cand se observa o modificare in fileInput
fileInput.addEventListener("change", procesareVideoIncarcat);

addEventListeners();

// Afisare notificare la adaugarea unui video nou
function notificareAdaugare() {
  const notification = document.getElementById("notification");
  notification.classList.add("show");

  setTimeout(() => {
    notification.classList.remove("show");
  }, 2000);   // ascundem notificarea dupa 2 secunde

}

// Notificare pentru stergerea unui videoclip
function notificareStergere() {
  const notification = document.getElementById("notification2");
  notification.classList.add("show");

  setTimeout(() => {
    notification.classList.remove("show");
  }, 2000); // ascundem notificarea dupa 2 secunde
}

// --------------------------------------------------- 3 -> Reordonare videoclipuri in playlist <- 3 ---------------------------------------------------

// Prevenim comportamentul default la actiunea de "drag"
document.querySelector(".video-list").addEventListener("dragover", (event) => {
  event.preventDefault();
});

// Tratam evenimentul de drop cand un element este tras in alt loc din playlist
document.querySelector(".video-list").addEventListener("drop", (event) => {
  event.preventDefault();

  const indexSursa = parseInt(event.dataTransfer.getData("text/plain")); // aflu pozitia clipului tras
  const targetVideo = event.target.closest(".vid");   // caut cel mai apropiat element .vid fata de locul unde am facut "drop"

  if (targetVideo) {

    const indexDestinatie = parseInt(targetVideo.dataset.index); // aflu pozitia clipului peste care am facut drop
    const listaVideoclipuri = Array.from(getPlaylist()); // creez un array pe baza videoclipurilor curente din playlist

    if (indexSursa !== indexDestinatie) {

      const [videoMutat] = listaVideoclipuri.splice(indexSursa, 1);  // sterg videoclipul mutat de la poz. originala si il inserez la noua poz.
      listaVideoclipuri.splice(indexDestinatie, 0, videoMutat);

      const playlist = document.querySelector(".video-list");
      playlist.innerHTML = ""; // golesc continutul playlist-ului

      // Parcurg lista de videoclipuri si adaug fiecare video din nou in playlist + re-actualizez pozitiile acestora
      listaVideoclipuri.forEach((video, index) => {

        video.dataset.index = index;
        playlist.appendChild(video);
      });

      addEventListeners();
    }
  }
});

// Mesaj pop-up cu informatii
const infoButton = document.getElementById("infoButton");
infoButton.addEventListener("click", function () {
  alert(
    "\t Ordinea videoclipurilor in playlist poate fi schimbata prin             drag-n-drop la pozitia dorita! \n \t Butonul de stergere va elimina videoclipul selectat din lista. \n \n Proiect realizat de Popescu Gabriel \n grupa 1091, seria D \n 2023-2024"
  );
});

// --------------------------------------------------- 4 -> Stergere videoclip din playlist <- 4 -----------------

const deleteButton = document.getElementById("deleteButton");
deleteButton.addEventListener("click", deleteVideo);

function deleteVideo() {
  let listaVideoclipuri = getPlaylist();
  const indexCurent = Array.from(listaVideoclipuri).findIndex((vid) => vid.classList.contains("active"));

  if (indexCurent !== -1) {
    listaVideoclipuri[indexCurent].remove();
    playVideo(indexCurent);
    notificareStergere();
  }
  else alert("Nu exista niciun videoclip pentru stergere.");
}

// --------------------------------------------------- 5-> Overlay controale video player <- 5 ---------------------------------------------------

const canvas = document.getElementById("canvasButoane");

// Buton PLAY/PAUSE
let playButton = document.getElementById("playButton");
playButton.textContent = "►";

playButton.addEventListener("click", function () {
  if (mainVideo.paused || mainVideo.ended) {
    mainVideo.play();
    playButton.classList.add("pause");
    playButton.textContent = "❚❚";
  } else {
    mainVideo.pause();
    playButton.classList.remove("pause");
    playButton.textContent = "►";
  }
});

// Buton NEXT
const nextButton = document.getElementById("nextButton");
nextButton.textContent = "►❚";

nextButton.addEventListener("click", function () {

  let listaVideoclipuri = getPlaylist();

  const nextIndex = (lastPlayedIndex + 1) % listaVideoclipuri.length;
  playVideo(nextIndex);
  playButton.textContent = "❚❚";
});

// Buton VOLUM / MUTE
const volumeButton = document.getElementById("muteButton");
const volumeIcon = document.getElementById("volumeIcon");

volumeButton.addEventListener("click", () => {

  mainVideo.muted = !mainVideo.muted;
  updateVolumeIcon(); // modificam iconita de volum in functie de nivel
});

function updateVolumeIcon() {
  const volumeIcon = document.getElementById("volumeIcon");

  if (mainVideo.muted || mainVideo.volume === 0) {
    volumeIcon.classList.remove("fa-volume-up");
    volumeIcon.classList.add("fa-volume-mute");
  } else {
    volumeIcon.classList.remove("fa-volume-mute");
    volumeIcon.classList.add("fa-volume-up");
  }
}

// VOLUME SLIDER
const volumeSlider = document.getElementById("volumeSlider");
const volumeSliderContainer = document.getElementById("volumeSliderContainer");

volumeSlider.addEventListener("input", function () {

  if (mainVideo.muted) mainVideo.muted = false;

  mainVideo.volume = volumeSlider.value / 100; // actualizare volum video pe baza valorii slider-ului

  updateVolumeIcon(); // actualizare iconita volum in functie de nivelul volumului
});

// Tratare evenimente "mouseenter" si "mouseleave" -> implementare efect fade pentru volume slider
volumeButton.addEventListener("mouseenter", function () {
  volumeSliderContainer.style.opacity = 1;
});

volumeButton.addEventListener("mouseleave", function () {
  setTimeout(() => {
    volumeSliderContainer.style.opacity = 0; // efect de fade pt. bara de volum aplicat dupa 1.5 sec.
  }, 1500);
});

// PROGRESS BAR si CURRENT TIME DISPLAY
const progressBar = document.getElementById("progressBar");

progressBar.addEventListener("click", function (event) {
  // Calculez pozitia click-ului raportata la latimea totala a progress bar-ului
  const pozitieCursor = event.clientX - progressBar.getBoundingClientRect().left;
  const latimeTotala = progressBar.clientWidth;

  const pozitieClickProcent = (pozitieCursor / latimeTotala) * 100; // calculez cat am parcurs din bara de progres dupa click
  const newTime = (pozitieClickProcent / 100) * mainVideo.duration; // calculez noul moment de timp al clipului

  mainVideo.currentTime = newTime; // setez videoclipul la momentul corespunzator click-ului
});

// Actualizare timp in format mm:ss langa progress bar
function actualizareTimp() {
  const playedProgress = document.getElementById("playedProgress");
  const remainingProgress = document.getElementById("remainingProgress");
  const timeDisplay = document.getElementById("timeDisplay");

  const currentTime = mainVideo.currentTime;
  const durata = mainVideo.duration;

  const progres = (currentTime / durata) * 100; // calculam cat am parcurs din video in procente

  // Actualizare progress bar - cat am parcurs si cat a mai ramas -> timpul parcurs colorat cu rosu, cel ramas cu gri
  playedProgress.style.width = `${progres}%`;
  remainingProgress.style.width = `${100 - progres}%`;

  // Actualizare time display
  const minute = Math.floor(currentTime / 60);
  const secunde = Math.floor(currentTime % 60);
  const durataMinute = Math.floor(durata / 60);
  const durataSecunde = Math.floor(durata % 60);

  timeDisplay.textContent = `${formatTimp(minute)}:${formatTimp(secunde)} / ${formatTimp(durataMinute)}:${formatTimp(durataSecunde)}`;
}

// Formatare timp in doua cifre
function formatTimp(timp) {
  return timp < 10 ? `0${timp}` : timp;
}

// Tratare eveniment "timeupdate" -> actualizare continua a progress bar-ului si a time display-ului
mainVideo.addEventListener("timeupdate", actualizareTimp);

// Buton FULLSCREEN
const fullscreenButton = document.getElementById("fullscreenButton");
const fullscreenIcon = document.getElementById("fullscreenIcon");
const videoContainer = document.querySelector(".video-container");

fullscreenButton.addEventListener("click", function () {
  if (!document.fullscreenElement) { // videoclipul nu se afla in modul fullscreen

    if (videoContainer.requestFullscreen)
      videoContainer.requestFullscreen();

    else if (videoContainer.mozRequestFullScreen) // suport Firefox
      videoContainer.mozRequestFullScreen();

    else if (videoContainer.webkitRequestFullscreen) // suport Chrome, Safari, Opera
      videoContainer.webkitRequestFullscreen();

    else if (videoContainer.msRequestFullscreen) // suport Microsoft Edge
      videoContainer.msRequestFullscreen();

    // Acutalizare iconita fullscreen
    fullscreenIcon.classList.remove("fa-expand");
    fullscreenIcon.classList.add("fa-compress");
  }
  else {    // Iesire din fullscreen
    if (document.exitFullscreen)
      document.exitFullscreen();

    else if (document.mozCancelFullScreen)
      document.mozCancelFullScreen();

    else if (document.webkitExitFullscreen)
      document.webkitExitFullscreen();

    else if (document.msExitFullscreen)
      document.msExitFullscreen();

    // Actualizare iconita fullscreen
    fullscreenIcon.classList.remove("fa-compress");
    fullscreenIcon.classList.add("fa-expand");
  }

});

// ------------------------------------------------------------- 6 -> Web Storage API <- 6 -------------------------------------------------------------

// Salvare informatii despre video player in localStorage si sessionStorage
function saveInfo() {

  let listaVideoclipuri = getPlaylist();
  const pozCurenta = Array.from(listaVideoclipuri).findIndex((vid) => vid.classList.contains("active"));

  const infoPlayerVideo = {
    volume: mainVideo.volume,
    index: pozCurenta,
    titlu: title.textContent.trim(),
    durata: mainVideo.duration
  };

  // Salvare in format JSON in localStorage si sessionStorage
  localStorage.setItem("infoPlayerVideo", JSON.stringify(infoPlayerVideo));
  sessionStorage.setItem("infoPlayerVideo", JSON.stringify(infoPlayerVideo));
}

// Incarcare informatii din localStorage
function loadInfo() {

  const informatiiSalvate = localStorage.getItem("infoPlayerVideo");

  if (informatiiSalvate) {

    const infoPlayerVideo = JSON.parse(informatiiSalvate);
    mainVideo.volume = infoPlayerVideo.volume; // setez volumul player-ului la val. salvata in localStorage -> este constanta si dupa refresh
  }
}

loadInfo(); // se apeleaza cand se incarca pagina/la refresh pt. a restaura volumul

mainVideo.addEventListener("timeupdate", saveInfo); // actualizare constanta a volumului si a pozitiei din playlist in obiectul JSON din storage


// ----------------------------------------------------- 7 -> Feature preview cadru deasupra progress bar-ului <- 7 -----------------------------------------------------

// Canvas pentru frame preview din video
const previewCanvas = document.createElement("canvas");
previewCanvas.id = "previewCanvas";
document.body.appendChild(previewCanvas);

let isPreviewVisible = false; // flag care monitorizeaza daca preview-ul este vizibil

// Tratare evenimente "mouseenter" si "mouseleave" asupra progress bar-ului
progressBar.addEventListener("mouseenter", function () {
  document.addEventListener("mousemove", updateCadruPreview);
});

progressBar.addEventListener("mouseleave", function () {
  document.removeEventListener("mousemove", updateCadruPreview);
  hidePreviewCanvas();
});

// Aflam momentul de timp din video pe baza pozitiei cursorului in progress bar
function updateCadruPreview(event) {

  if (isPreviewVisible) {
    return; // previne actualizarea preview-ului daca este deja vizibil
  }

  // Calculam pozitia locului in care am pus mouse-ul pe progress bar relativ la lungimea acesteia
  const pozitieCursor = event.clientX - progressBar.getBoundingClientRect().left;
  const lungimeTotala = progressBar.clientWidth;

  const pozCursorProcente = (pozitieCursor / lungimeTotala) * 100; // pozitia cursorului pe progress bar exprimata in procente

  const previewMoment = (pozCursorProcente / 100) * mainVideo.duration; // momentul de timp echivalent in video

  updateCanvasPreview(previewMoment, event.clientX, event.clientY); // actualizam frame-ul din canvas la momentul cautat
}

// Ascundere preview canvas si resetare flag
function hidePreviewCanvas() {
  previewCanvas.style.display = "none";
  isPreviewVisible = false;
}

// Actualizare frame din canvas la un moment specific
function updateCanvasPreview(time, mouseX, mouseY) {

  isPreviewVisible = true; // setare flag pe true pt. a indica vizibilitatea preview-ului

  // Clonare videoclip principal pt. afisarea frame-ului in canvas din clipul copiat
  const copieVideoclip = mainVideo.cloneNode(true);
  copieVideoclip.muted = true;
  copieVideoclip.currentTime = time;

  // Extragem frame-ul din videoclipul clonat prin setarea acestuia la momentul de timp specificat

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  // Ne asiguram ca videoclipul a fost incarcat inainte de a continua
  copieVideoclip.addEventListener("loadeddata", function () {
    const previewWidth = 150;
    const previewHeight = 100;

    canvas.width = copieVideoclip.videoWidth;
    canvas.height = copieVideoclip.videoHeight;
    context.drawImage(copieVideoclip, 0, 0, canvas.width, canvas.height);

    // Actualizare canvas preview cu frame-ul dorit
    const previewContext = previewCanvas.getContext("2d");
    previewCanvas.width = previewWidth;
    previewCanvas.height = previewHeight;
    previewContext.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, previewWidth, previewHeight);

    // Pozitionare canvas preview deasupra cursorului
    const previewOffsetX = -70;
    const previewOffsetY = 15;

    previewCanvas.style.left = mouseX + previewOffsetX + "px";
    previewCanvas.style.top = mouseY - previewOffsetY - previewCanvas.height + "px";

    previewCanvas.style.display = "block"; // afisare canvas preview
    setTimeout(hidePreviewCanvas, 5000);  // ascundere canvas preview dupa un delay de 5 secunde
  });
}