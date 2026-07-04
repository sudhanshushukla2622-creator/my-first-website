// ============ CONSTANTS AND VARIABLES ============ //

// Game DOM Elements
const keyboardContainer = document.querySelector(".keyboard");
const wordDisplayContainer = document.querySelector(".word-display");
const remainingGuessesElement = document.querySelector(".guesses-text b");
const hangmanImageElement = document.querySelector(".hangman-box img");
const gameEndModal = document.querySelector(".game-modal");
const restartButton = document.querySelector(".play-again");
const timerText = document.querySelector(".timer");

// Game Settings
let selectedWord; // word to be guessed in the current game
let guessedLetters = []; // letters that have been correctly guessed
let wrongGuessCount = 0; // count of incorrect guesses
const maxGuessesAllowed = 6; // max number of incorrect guesses before game over

// Timer Settings
const initialTime = 60; // starting time in seconds
let remainingTime = initialTime;
let timerInterval; // interval for the game timer

// ============ HELPER FUNCTIONS ============ //

// Format seconds into MM:SS format
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};

// Display game over modal with win or loss message
const displayGameOverModal = (isWin) => {
  // Stop the timer when the game ends
  clearInterval(timerInterval);

  // Disable all keyboard buttons
  keyboardContainer
    .querySelectorAll("button")
    .forEach((button) => (button.disabled = true));

  // Set modal message and image based on the game outcome
  const modalMessage = isWin ? "You found the word:" : "The correct word was:";
  gameEndModal.querySelector("img").src = `images/${
    isWin ? "victory" : "lost"
  }.gif`;
  gameEndModal.querySelector("h4").innerText = isWin
    ? "Congrats!"
    : "Game Over!";
  gameEndModal.querySelector(
    "p"
  ).innerHTML = `${modalMessage} <b>${selectedWord.toUpperCase()}</b>`;

  // Play respective sound
  const audio = new Audio(
    isWin ? "./sounds/game-win.wav" : "./sounds/game-over.wav"
  );
  audio.play();

  // Show game end modal
  gameEndModal.classList.add("show");
};

// Start and manage the game timer countdown
const startTimer = () => {
  clearInterval(timerInterval); // clear any existing timer
  remainingTime = initialTime;
  timerText.innerText = formatTime(remainingTime);

  timerInterval = setInterval(() => {
    remainingTime--;
    timerText.innerText = formatTime(remainingTime);

    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      displayGameOverModal(false); // trigger game over when time runs out
    }
  }, 1000);
};

// Reset the game for a new round
const resetGame = () => {
  guessedLetters = [];
  wrongGuessCount = 0;
  remainingGuessesElement.innerText = `${wrongGuessCount}/${maxGuessesAllowed}`;

  // Enable all keyboard buttons for the new game
  keyboardContainer
    .querySelectorAll("button")
    .forEach((button) => (button.disabled = false));

  // Display empty placeholders for the letters in the selected word
  wordDisplayContainer.innerHTML = selectedWord
    .split("")
    .map(() => '<li class="letter"></li>')
    .join("");

  // Reset hangman image and hide end modal
  hangmanImageElement.src = `images/hangman-0.svg`;
  gameEndModal.classList.remove("show");

  // Start the timer
  startTimer();
};

// Select a random word from the word list and initialize game with it
const selectRandomWord = () => {
  const randomIndex = Math.floor(Math.random() * wordList.length);
  const { word, hint } = wordList[randomIndex];
  selectedWord = word;

  // Display the hint for the selected word
  document.querySelector(".hint-text b").innerHTML = hint;
  resetGame();
};

// ============ GAME LOGIC FUNCTIONS ============ //

// Handle player's guessed letter, update display and check for win/loss
const handleLetterGuess = (button, guessedLetter) => {
  if (selectedWord.includes(guessedLetter)) {
    // If letter is correct, reveal it in word display
    [...selectedWord].forEach((letter, index) => {
      if (letter === guessedLetter) {
        guessedLetters.push(letter);
        wordDisplayContainer.querySelectorAll("li")[index].innerText = letter;
        wordDisplayContainer
          .querySelectorAll("li")
          [index].classList.add("guessed");
      }
    });
  } else {
    // If incorrect, increment wrong guesses and update hangman image
    wrongGuessCount++;
    hangmanImageElement.src = `images/hangman-${wrongGuessCount}.svg`;
  }

  // Disable the guessed button
  button.disabled = true;

  // Update incorrect guesses count
  remainingGuessesElement.innerText = `${wrongGuessCount}/${maxGuessesAllowed}`;

  // Check for game over or word completion
  if (wrongGuessCount === maxGuessesAllowed) return displayGameOverModal(false);
  if (guessedLetters.length === selectedWord.length)
    return displayGameOverModal(true);

  // Play key press sound
  const audio = new Audio("./sounds/key-click.mp3");
  audio.play();
};

// ============ EVENT LISTENERS ============ //

// Generate keyboard buttons and set up event listeners
for (let i = 97; i <= 122; i++) {
  const letterButton = document.createElement("button");
  const letter = String.fromCharCode(i);

  letterButton.innerText = letter;
  letterButton.setAttribute("data-key", letter); // Attach data-key attribute
  keyboardContainer.appendChild(letterButton);

  // Click event to handle letter guesses
  letterButton.addEventListener("click", (event) =>
    handleLetterGuess(event.target, letter)
  );
}

// Keyboard event listener for physical key presses
window.addEventListener("keydown", (event) => {
  const pressedKey = event.key.toLowerCase();

  // Check if the pressed key is a letter between 'a' and 'z'
  if (pressedKey >= "a" && pressedKey <= "z") {
    const correspondingButton = keyboardContainer.querySelector(
      `[data-key="${pressedKey}"]`
    );

    // Simulate button click if button is not disabled
    if (correspondingButton && !correspondingButton.disabled) {
      handleLetterGuess(correspondingButton, pressedKey);
    }
  }
});

// Restart game when "Play Again" button is clicked
restartButton.addEventListener("click", selectRandomWord);

// ============ INITIALIZE GAME ============ //

// Start game with a random word on page load
selectRandomWord();
