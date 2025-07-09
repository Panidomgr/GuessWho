// Toggling red X
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', () => {
        // If we're in selection mode, skip toggle
        if (window.selectingCharacter && !window.characterChosen) {
          const img = card.querySelector('img');
          const chosenCard = document.getElementById('chosenCard');
          chosenCard.innerHTML = ''; // Clear any previous contents
          const clone = img.cloneNode(true);
          chosenCard.appendChild(clone);
          chosenCard.classList.remove('active');
          window.selectingCharacter = false;
          window.characterChosen = true;
        } else {
          // Normal toggle of X
          card.classList.toggle('toggled');
        }
      });
    });

    // Selection mode handler
    const chosenCard = document.getElementById('chosenCard');
    window.selectingCharacter = false;
    window.characterChosen = false;

    chosenCard.addEventListener('click', () => {
      if (!window.characterChosen) {
        window.selectingCharacter = true;
        chosenCard.classList.add('active');
      }
    });