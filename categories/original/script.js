window.nonSpoilerText = "Placeholder Label";
window.nonSpoilerImgSrc = "./../../images/GuessWhoLogo.png";

// Game state variables
window.selectingCharacter = false;
window.characterChosen = false;
window.spoilerOn = false;
window.isResetting = false;

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
  // Set loading state
  document.body.classList.add('loading');
  
  // Initialize chosen card display (no spoiler by default)
  const chosenCardImg = document.querySelector('#chosenCard img');
  const chosenLabel = document.getElementById('chosenLabel');
  chosenCardImg.src = "./../../images/GuessWhoLogo.png";
  chosenLabel.textContent = 'Placeholder Label';
  chosenLabel.classList.remove('spoiler');
  
  // Set up card animations
  setTimeout(() => {
    document.querySelectorAll('.card').forEach((card, index) => {
      card.style.animation = `cardEntry 0.6s ease-out ${0.1 * index + 1.5}s forwards`;
    });
    
    // Calculate when all animations should be done (longest delay + duration)
    const totalAnimationTime = (0.1 * (document.querySelectorAll('.card').length - 1) + 1.5 + 0.6) * 1000;
    
    // Load saved game after cards appear and animations complete
    setTimeout(() => {
      loadGame();
    }, totalAnimationTime);
  }, 1500);

  // Card click handler
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      if (window.isResetting) return;
      
      if (window.selectingCharacter && !window.characterChosen) {
        selectCharacter(card);
      } else {
        card.classList.toggle('toggled');
        saveGame();
      }
    });
  });

  // Chosen card click handler
  const chosenCard = document.getElementById('chosenCard');
  chosenCard.addEventListener('click', () => {
    if (!window.characterChosen && !window.isResetting) {
      window.selectingCharacter = true;
      chosenCard.classList.add('active');
    }
  });

  // Spoiler button handler
  const spoilerButton = document.getElementById('spoilerButtonToggle');
  spoilerButton.addEventListener('click', () => {
    if (window.isResetting) return;
    
    if (!window.characterChosen) {
      alert("Please select a character first!");
      return;
    }

    if (window.spoilerOn) {
      const confirmReveal = confirm("Are you sure you want to reveal your guess?");
      if (!confirmReveal) return;
    }

    toggleSpoiler();
  });

  // New Game button handler
  const newGameButton = document.getElementById('startNewGame');
  newGameButton.addEventListener('click', startNewGame);
});

function selectCharacter(card) {
  const img = card.querySelector('img');
  const chosenCard = document.getElementById('chosenCard');
  const chosenCardImg = chosenCard.querySelector('img');
  
  // Store character data
  window.nonSpoilerImgSrc = img.src;
  window.nonSpoilerText = card.querySelector('.label').textContent;
  
  // Update display
  chosenCardImg.src = img.src;
  document.getElementById('chosenLabel').textContent = window.nonSpoilerText;

  // Animation
  chosenCardImg.style.transform = 'scale(1.1)';
  setTimeout(() => {
    chosenCardImg.style.transform = 'scale(1)';
  }, 300);
  
  // Set spoiler on by default
  window.spoilerOn = true;
  toggleSpoiler(true);
  
  // Set selection states
  chosenCard.classList.remove('active');
  window.selectingCharacter = false;
  window.characterChosen = true;
  
  saveGame();
}

function toggleSpoiler(forceState) {
  const spoilerButton = document.getElementById('spoilerButtonToggle');
  const chosenLabel = document.getElementById('chosenLabel');
  const chosenCardImg = document.querySelector('#chosenCard img');
  
  if (forceState !== undefined) {
    window.spoilerOn = forceState;
  } else {
    window.spoilerOn = !window.spoilerOn;
  }
  
  spoilerButton.classList.toggle('active', window.spoilerOn);
  
  if (window.spoilerOn) {
    chosenLabel.textContent = 'SPOILER';
    chosenLabel.classList.add('spoiler');
    chosenCardImg.src = "./../../images/GuessWhoLogo.png";
  } else {
    chosenLabel.textContent = window.nonSpoilerText;
    chosenLabel.classList.remove('spoiler');
    chosenCardImg.src = window.nonSpoilerImgSrc;
  }
  
  saveGame();
}

function saveGame() {
  if (!window.characterChosen) return;
  
  const toggledCards = Array.from(document.querySelectorAll('.card')).map(card => 
    card.classList.contains('toggled')
  );
  
  localStorage.setItem('guessWhoSave', JSON.stringify({
    toggledCards,
    chosenCharacter: window.nonSpoilerText,
    spoilerOn: window.spoilerOn
  }));
}

async function loadGame() {
  const saved = JSON.parse(localStorage.getItem('guessWhoSave'));
  
  // If no saved game, just remove loading state immediately
  if (!saved) {
    document.body.classList.remove('loading');
    return;
  }
  
  // Immediately hide the chosen card (spoiler on)
  const chosenCard = document.getElementById('chosenCard');
  const chosenCardImg = chosenCard.querySelector('img');
  const chosenLabel = document.getElementById('chosenLabel');
  
  chosenCardImg.src = "./../../images/GuessWhoLogo.png";
  chosenLabel.textContent = 'SPOILER';
  chosenLabel.classList.add('spoiler');
  
  // Find and select the chosen character
  const characterCard = [...document.querySelectorAll('.card')].find(card => 
    card.querySelector('.label').textContent === saved.chosenCharacter
  );
  
  if (characterCard) {
    // Store character data but don't display it yet
    const img = characterCard.querySelector('img');
    window.nonSpoilerImgSrc = img.src;
    window.nonSpoilerText = characterCard.querySelector('.label').textContent;
    
    // Set selection states
    chosenCard.classList.remove('active');
    window.selectingCharacter = false;
    window.characterChosen = true;
    window.spoilerOn = true;
    
    // Update spoiler button state
    const spoilerButton = document.getElementById('spoilerButtonToggle');
    spoilerButton.classList.add('active');
    
    // Apply saved toggled states with sequential animation
    const toggledCards = [...document.querySelectorAll('.card')].filter((card, index) => 
      saved.toggledCards[index]
    );
    
    for (const card of toggledCards) {
      card.classList.add('toggled');
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Save the game to ensure consistency
    saveGame();
  }
  
  // Remove loading state
  document.body.classList.remove('loading');
}

async function startNewGame() {
  if (window.isResetting) return;
  
  // Check if there's a game to reset
  if (!localStorage.getItem('guessWhoSave')) {
    alert("No saved game to reset!");
    return;
  }
  
  window.isResetting = true;
  document.body.classList.add('resetting');
  const newGameButton = document.getElementById('startNewGame');
  newGameButton.classList.add('active');
  
  // Untoggle all cards one by one
  const toggledCards = document.querySelectorAll('.card.toggled');
  if (toggledCards.length > 0) {
    for (const card of toggledCards) {
      card.classList.remove('toggled');
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  // Reset chosen card
  const chosenCard = document.getElementById('chosenCard');
  const chosenCardImg = chosenCard.querySelector('img');
  chosenCardImg.src = "./../../images/GuessWhoLogo.png";
  document.getElementById('chosenLabel').textContent = "Placeholder Label";
  document.getElementById('chosenLabel').classList.remove('spoiler');
  
  // Reset game state
  window.nonSpoilerText = "Placeholder Label";
  window.nonSpoilerImgSrc = "./../../images/GuessWhoLogo.png";
  window.selectingCharacter = false;
  window.characterChosen = false;
  window.spoilerOn = false;
  
  // Reset spoiler button
  const spoilerButton = document.getElementById('spoilerButtonToggle');
  spoilerButton.classList.remove('active');
  
  // Clear storage
  localStorage.removeItem('guessWhoSave');
  
  // Remove reset state immediately after animations complete
  newGameButton.classList.remove('active');
  document.body.classList.remove('resetting');
  window.isResetting = false;
}
