// Toggling red X
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => {
    const img = card.querySelector('img');
    const label = card.querySelector('.label')?.textContent || '';

    if (window.selectingCharacter && !window.characterChosen) {
      const chosenCard = document.getElementById('chosenCard');
      const chosenLabel = document.getElementById('chosenLabel');

      chosenCard.innerHTML = ''; // Clear previous
      const clone = img.cloneNode(true);
      chosenCard.appendChild(clone);

      chosenLabel.textContent = label;

      chosenCard.classList.remove('active');
      window.selectingCharacter = false;
      window.characterChosen = true;
    } else {
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
