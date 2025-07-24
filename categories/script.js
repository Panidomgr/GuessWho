window.nonSpoilerText = "Placeholder Label";
window.nonSpoilerImgSrc = "https://res.cloudinary.com/dhon1edrf/image/upload/f_auto,q_auto/v1753260680/GuessWhoLogo_k7drm2.png";
window.nonSpoilerVideoSrc = null;
window.currentCategory = document.body.dataset.category || 'original';

const defaultImgHTML = `<img src="https://res.cloudinary.com/dhon1edrf/image/upload/f_auto,q_auto/v1753260680/GuessWhoLogo_k7drm2.png">`;

window.selectingCharacter = false;
window.characterChosen = false;
window.spoilerOn = false;
window.isResetting = false;

function getSaveKey() {
  return `guessWhoSave_${window.currentCategory}`;
}

function createVideoHTML(src) {
  return `
    <video id="chosenVideo" src="${src}" autoplay loop muted></video>
    <div class="controls">
      <div class="playButton"><i class="fas fa-pause"></i></div>
      <div class="muteButton"><i class="fas fa-volume-mute"></i></div>
    </div>`;
}

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loading');
  const chosenCard = document.getElementById('chosenCard');
  const chosenLabel = document.getElementById('chosenLabel');
  chosenCard.innerHTML = defaultImgHTML;
  chosenLabel.textContent = window.nonSpoilerText;

  const cards = document.querySelectorAll('.card');
  const lastCard = cards[cards.length - 1];

  // Start all animations
  cards.forEach((card, i) => {
    card.style.animation = `cardEntry 0.6s ease-out ${0.1 * i}s forwards`;
  });

  // When last animation finishes, remove loading state
  lastCard.addEventListener('animationend', () => {
    document.body.classList.remove('loading');
    loadGame();
  }, { once: true });

  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', (event) => {
      if (["playButton", "muteButton", "controls"].some(cls => event.target.classList.contains(cls))) return;
      if (window.isResetting) return;

      if (window.selectingCharacter && !window.characterChosen) {
        selectCharacter(card);
      } else {
        card.classList.toggle('toggled');
        saveGame(); // Explicit save on every toggle
      }
    });
  });

  chosenCard.addEventListener('click', () => {
    if (!window.characterChosen && !window.isResetting) {
      window.selectingCharacter = true;
      chosenCard.classList.add('active');
      chosenCard.style.transition = 'transform 0.3s ease';
      chosenCard.style.transform = 'scale(1.05)';
      setTimeout(() => {
        chosenCard.style.transform = 'scale(1)';
      }, 300);
    }
  });

  document.getElementById('spoilerButtonToggle').addEventListener('click', () => {
    if (window.isResetting) return;
    if (!window.characterChosen) return alert("Please select a character first!");
    if (window.spoilerOn && !confirm("Are you sure you want to reveal your card?")) return;
    toggleSpoiler();
  });

  document.getElementById('startNewGame').addEventListener('click', startNewGame);

  setupVideoControls();
});

function selectCharacter(card) {
  const chosenCard = document.getElementById('chosenCard');
  const label = card.querySelector('.label').textContent;

  // Save label and media type only in memory — do NOT display chosen card yet
  window.nonSpoilerText = label;
  if (card.classList.contains('video')) {
    window.nonSpoilerVideoSrc = card.querySelector('video').src;
    window.nonSpoilerImgSrc = null;
  } else {
    window.nonSpoilerImgSrc = card.querySelector('img').src;
    window.nonSpoilerVideoSrc = null;
  }

  document.getElementById('chosenLabel').textContent = 'SPOILER';
  document.getElementById('chosenLabel').classList.add('spoiler');
  chosenCard.innerHTML = defaultImgHTML;

  // Enable spoiler immediately without flash
  window.spoilerOn = true;
  document.getElementById('spoilerButtonToggle').classList.add('active');
  document.getElementById('spoilerButtonToggle').textContent = "Show Your Card!";

  chosenCard.classList.remove('active');
  window.selectingCharacter = false;
  window.characterChosen = true;

  saveGame();
}

function toggleSpoiler(forceState) {
  const label = document.getElementById('chosenLabel');
  const card = document.getElementById('chosenCard');

  window.spoilerOn = forceState !== undefined ? forceState : !window.spoilerOn;
  const btn = document.getElementById('spoilerButtonToggle');
  btn.classList.toggle('active', window.spoilerOn);

  card.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
  card.style.opacity = '0.6';
  card.style.transform = 'scale(0.95)';

  setTimeout(() => {
    if (window.spoilerOn) {
      label.textContent = 'SPOILER';
      label.classList.add('spoiler');
      card.innerHTML = defaultImgHTML;
      btn.textContent = window.spoilerOn ? "Show Your Card!" : "Hide Your Card!";
    } else {
      label.textContent = window.nonSpoilerText;
      label.classList.remove('spoiler');
      if (window.nonSpoilerVideoSrc) {
        card.innerHTML = createVideoHTML(window.nonSpoilerVideoSrc);
        setupVideoControls();
      } else {
        card.innerHTML = `<img src="${window.nonSpoilerImgSrc}">`;
      }
      btn.textContent = "Hide Your Card!";
    }
    card.style.opacity = '1';
    card.style.transform = 'scale(1)';
  }, 150);

  saveGame();
}

function saveGame() {
  try {
    const saveKey = getSaveKey();
    const toggled = [...document.querySelectorAll('.card')].map(c => c.classList.contains('toggled'));

    localStorage.setItem(saveKey, JSON.stringify({
      toggledCards: toggled,
      chosenCharacter: window.nonSpoilerText,
      isVideo: !!window.nonSpoilerVideoSrc,
      videoSrc: window.nonSpoilerVideoSrc,
      imgSrc: window.nonSpoilerImgSrc,
      category: window.currentCategory
      // Removed spoilerOn from saved data
    }));
  } catch (e) {
    console.error("Failed to save game:", e);
  }
}

async function loadGame() {
  const saveKey = getSaveKey();
  const saved = JSON.parse(localStorage.getItem(saveKey));

  if (!saved) {
    document.body.classList.remove('loading');
    return;
  }

  const label = document.getElementById('chosenLabel');
  const card = document.getElementById('chosenCard');
  const spoilerButton = document.getElementById('spoilerButtonToggle');

  // Restore toggled cards first
  const savedToggledCards = saved.toggledCards || [];
  document.querySelectorAll('.card').forEach((c, i) => {
    if (savedToggledCards[i]) c.classList.add('toggled');
  });

  // Handle character and spoiler state
  if (saved.chosenCharacter && saved.chosenCharacter !== "Placeholder Label") {
    window.nonSpoilerText = saved.chosenCharacter;
    window.nonSpoilerImgSrc = saved.imgSrc;
    window.nonSpoilerVideoSrc = saved.isVideo ? saved.videoSrc : null;
    window.characterChosen = true;
    window.selectingCharacter = false;

    // Always start with spoiler on (hidden state)
    window.spoilerOn = true;

    // Update UI to show spoiler state
    label.textContent = 'SPOILER';
    label.classList.add('spoiler');
    card.innerHTML = defaultImgHTML;
    spoilerButton.textContent = "Show Your Card!";
    spoilerButton.classList.add('active');
  } else {
    // No valid character
    label.textContent = "Placeholder Label";
    label.classList.remove('spoiler');
    card.innerHTML = defaultImgHTML;
    spoilerButton.textContent = "Hide Your Card!";
    spoilerButton.classList.remove('active');
    window.spoilerOn = false;
    window.characterChosen = false;
  }

  document.body.classList.remove('loading');
}

async function startNewGame() {
  const saveKey = getSaveKey();
  if (window.isResetting || !localStorage.getItem(saveKey)) return alert("No saved game to reset!");
  if (!confirm("Are you sure you want to start a new game?")) return;

  window.isResetting = true;
  document.body.classList.add('resetting');
  const toggled = document.querySelectorAll('.card.toggled');
  for (const c of toggled) {
    c.classList.remove('toggled');
    await new Promise(res => setTimeout(res, 100));
  }

  const card = document.getElementById('chosenCard');
  card.innerHTML = defaultImgHTML;
  document.getElementById('chosenLabel').textContent = "Placeholder Label";
  document.getElementById('chosenLabel').classList.remove('spoiler');
  window.nonSpoilerText = "Placeholder Label";
  window.nonSpoilerImgSrc = "./../../images/GuessWhoLogo.png";
  window.nonSpoilerVideoSrc = null;
  window.selectingCharacter = false;
  window.characterChosen = false;
  window.spoilerOn = false;
  localStorage.removeItem(saveKey);

  document.getElementById('spoilerButtonToggle').classList.remove('active');
  document.getElementById('startNewGame').classList.remove('active');
  document.body.classList.remove('resetting');
  window.isResetting = false;
}

function setupVideoControls() {
  document.querySelectorAll('.playButton').forEach(btn => {
    btn.onclick = (e) => {
      const card = e.target.closest('.card, #chosenCard');
      const video = card.querySelector('video');
      if (!video) return;
      if (video.paused) {
        video.play();
        btn.innerHTML = '<i class="fas fa-pause"></i>';
      } else {
        video.pause();
        btn.innerHTML = '<i class="fas fa-play"></i>';
      }
    };
  });

  document.querySelectorAll('.muteButton').forEach(btn => {
    const card = btn.closest('.card, #chosenCard');
    const video = card.querySelector('video');
    if (video) {
      video.muted = true;
      btn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    }
    btn.onclick = (e) => {
      const video = btn.closest('.card, #chosenCard').querySelector('video');
      if (!video) return;
      video.muted = !video.muted;
      btn.innerHTML = `<i class="fas fa-volume-${video.muted ? 'mute' : 'up'}"></i>`;
    };
  });
}
