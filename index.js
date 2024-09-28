document.addEventListener("DOMContentLoaded", function () {
    const cups = document.querySelectorAll(".cup-container");
    const balls = document.querySelectorAll(".ball");
    const playButton = document.getElementById("playButton");
  
    // Define valid left positions for the cups and balls
    const validPositions = ['10%', '40%', '70%']; // Left positions for cups and balls
    let currentCupPositions = [0, 1, 2]; // Tracks current logical positions of the cups
    let ballPosition = null;
    let cupsAreUp = false; // Indicates whether the cups are currently up
  
    // Function to apply left position based on valid positions
    function applyPosition(index, positionIndex) {
      const percentagePosition = validPositions[positionIndex];
      cups[index].style.left = percentagePosition;
      balls[index].style.left = percentagePosition;
    }
  
    // Function to randomly place the ball under one of the cups
    function placeBall() {
      ballPosition = Math.floor(Math.random() * 3); // Randomly pick 0, 1, or 2
      console.log(`Ball is under Cup ${ballPosition + 1}`);
    }
  
    // Function to perform the light-up animation
    function lightUpCup() {
      return new Promise((resolve) => {
        // Get the cup that has the ball
        const cupIndex = currentCupPositions.indexOf(ballPosition);
        const cupContainer = cups[cupIndex];
        const silhouette = cupContainer.querySelector('.cup-silhouette');
  
        // Animate the opacity of the silhouette from 0 to 1
        silhouette.style.opacity = 1;
  
        // Wait for the opacity transition to complete
        setTimeout(() => {
          resolve();
        }, 1000); // Duration matches the CSS transition
      });
    }
  
    // Function to reveal the ball
    function revealBall() {
      return new Promise((resolve) => {
        // Slide up all cups
        cups.forEach((cup) => {
          cup.style.transform = 'translateY(-50px)'; // Adjust slide distance as needed
        });
  
        // Show the ball under the correct cup
        const cupIndex = currentCupPositions.indexOf(ballPosition);
        const ball = balls[cupIndex];
        ball.style.display = 'block';
  
        // Set cupsAreUp to true
        cupsAreUp = true;
  
        // Wait for the slide-up animation to complete
        setTimeout(() => {
          // Re-enable the play button
          playButton.disabled = false;
  
          resolve(); // Resolve the promise
        }, 500); // Duration of the slide-up animation
      });
    }
  
    // Function to slide cups down and hide the ball
    function slideCupsDown() {
      return new Promise((resolve) => {
        // Slide all cups back down
        cups.forEach((cup) => {
          cup.style.transform = 'translateY(0)';
        });
  
        // Hide all balls
        balls.forEach((ball) => {
          ball.style.display = 'none';
        });
  
        // Wait for the slide-down animation to complete
        setTimeout(() => {
          // Set cupsAreUp to false
          cupsAreUp = false;
  
          resolve(); // Resolve the promise
        }, 500); // Duration of the slide-down animation
      });
    }
  
    // Function to shuffle the cups between valid positions
    function shuffleCups() {
      return new Promise((resolve) => {
        let shuffleCount = 6; // Number of swaps
        let currentShuffle = 0;
  
        const shuffleInterval = setInterval(() => {
          if (currentShuffle >= shuffleCount) {
            clearInterval(shuffleInterval);
            resolve(); // Continue after shuffling is done
          } else {
            // Pick two different random cups to swap positions
            const [firstIndex, secondIndex] = pickTwoRandomIndices();
  
            // Swap their positions logically
            const temp = currentCupPositions[firstIndex];
            currentCupPositions[firstIndex] = currentCupPositions[secondIndex];
            currentCupPositions[secondIndex] = temp;
  
            // Apply left positions to reflect the new positions
            applyPosition(firstIndex, currentCupPositions[firstIndex]);
            applyPosition(secondIndex, currentCupPositions[secondIndex]);
  
            currentShuffle++;
          }
        }, 500); // Shuffle every 0.5 second
      });
    }
  
    // Helper function to pick two different random indices
    function pickTwoRandomIndices() {
      const indices = [0, 1, 2]; // Possible cup indices
      const firstIndex = indices.splice(Math.floor(Math.random() * indices.length), 1)[0];
      const secondIndex = indices.splice(Math.floor(Math.random() * indices.length), 1)[0];
      return [firstIndex, secondIndex];
    }
  
    // Function to reset the game state for the next round
    function resetGame() {
      ballPosition = null; // Reset the ball position
      // Cups positions remain as they are
    }
  
    // Main game logic
    playButton.addEventListener("click", async () => {
      if (cupsAreUp) {
        // Cups are up; slide them down and hide the ball before starting a new game
        await slideCupsDown();
        resetGame(); // Reset game state for the next round
      }
  
      playButton.disabled = true; // Disable play button during shuffle
      placeBall(); // Randomly place the ball under a cup
      await shuffleCups(); // Shuffle the cups
      await lightUpCup(); // Perform light-up animation
      await revealBall(); // Slide up cups and reveal the ball
      // No need to re-enable the play button here; it's done in revealBall()
    });
  
    // Initial setup: set the cups and balls to their starting positions
    currentCupPositions.forEach((position, index) => {
      applyPosition(index, position); // Apply initial positions
    });
  });
  