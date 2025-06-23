const music = document.getElementById("bg-music");
const toggleBtn = document.getElementById("music-toggle");

let isPlaying = false;
let hasTried = false;

function tryPlayMusic() {
  if (!hasTried) {
    music.play().then(() => {
      isPlaying = true;
      toggleBtn.textContent = "🔊";
      toggleBtn.style.display = "block";
      console.log("Music autoplay success on scroll.");
    }).catch((err) => {
      console.warn("Music autoplay blocked:", err);
    });
    hasTried = true;
  }
}

// Main trigger: scroll
window.addEventListener("scroll", tryPlayMusic, { once: true });

// Toggle button
toggleBtn.addEventListener("click", () => {
  if (isPlaying) {
    music.pause();
    toggleBtn.textContent = "🔈";
  } else {
    music.play();
    toggleBtn.textContent = "🔊";
  }
  isPlaying = !isPlaying;
});
