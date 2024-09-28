document.addEventListener("DOMContentLoaded", function () {
    const cups = document.querySelectorAll(".cup-container");
    const balls = document.querySelectorAll(".ball");
    const playButton = document.getElementById("playButton");

    // Define valid left positions for the cups and balls
    const validPositions = ['10%', '40%', '70%']; // Left positions for cups and balls
    let currentCupPositions = [0, 1, 2]; // Tracks current logical positions of the cups
    let ballPosition = null;

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

    function revealBall() {
        return new Promise((resolve) => {
            // Get the cup that has the ball
            const cupIndex = currentCupPositions.indexOf(ballPosition);
            const cupContainer = cups[cupIndex];

            // Slide up only the cup with the ball
            cupContainer.style.transform = 'translateY(-50px)'; // Adjust slide distance as needed

            // Show the ball under the correct cup
            const ball = balls[cupIndex];
            ball.style.display = 'block';

            // Wait for the slide-up animation to complete
            setTimeout(() => {
                // Keep the cup up for a moment (adjust delay as needed)
                setTimeout(() => {
                    // Slide the cup back down
                    cupContainer.style.transform = 'translateY(0)';

                    // Wait for the slide-down animation to complete
                    setTimeout(() => {
                        // Hide the ball again
                        ball.style.display = 'none';

                        // Re-enable the play button
                        playButton.disabled = false;

                        resolve(); // Resolve the promise
                    }, 500); // Duration of the slide-down animation
                }, 1500); // Delay before the cup slides back down (ball remains visible)
            }, 500); // Duration of the slide-up animation
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
            }, 500); // Shuffle every 0.5 second for quicker animation
        });
    }

    // Helper function to pick two different random indices
    function pickTwoRandomIndices() {
        const indices = [0, 1, 2]; // Possible cup indices
        const firstIndex = indices.splice(Math.floor(Math.random() * indices.length), 1)[0];
        const secondIndex = indices.splice(Math.floor(Math.random() * indices.length), 1)[0];
        return [firstIndex, secondIndex];
    }

    // Function to reset the cups and balls to their initial positions
    function resetGame() {
        currentCupPositions = [0, 1, 2]; // Reset logical positions
        currentCupPositions.forEach((position, index) => {
            applyPosition(index, position); // Reset each cup and ball to their original position

            const cupContainer = cups[index];
            cupContainer.style.transform = 'translateY(0)'; // Reset transform

            const silhouette = cupContainer.querySelector('.cup-silhouette');
            silhouette.style.opacity = 0; // Hide silhouette

            const ball = balls[index];
            ball.style.display = 'none'; // Hide ball
        });
        ballPosition = null;
        playButton.disabled = false;
    }

    // Main game logic
    playButton.addEventListener("click", async () => {
        playButton.disabled = true; // Disable play button during shuffle
        placeBall(); // Randomly place the ball under a cup
        await shuffleCups(); // Shuffle the cups
        await lightUpCup(); // Perform light-up animation
        await revealBall(); // Slide up cup and reveal the ball
        // Wait for a moment before resetting the game
        setTimeout(() => {
            resetGame(); // Reset game after showing the ball
        }, 2000); // Adjust as needed
    });

    // Initial setup: set the cups and balls to their starting positions
    resetGame();

    // Function to blur input when tapping outside
    function blurActiveInput(event) {
        // Elements that should not cause the input to blur when clicked
        const ignoreElements = ['INPUT', 'LABEL', 'TEXTAREA', 'BUTTON', 'A', 'SELECT'];

        // Check if the clicked element is inside a form group or is an element to ignore
        if (!event.target.closest('.form-group') && !ignoreElements.includes(event.target.tagName)) {
            // Blur the currently focused element if it's an input or textarea
            if (
                document.activeElement &&
                (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')
            ) {
                document.activeElement.blur();
            }
        }
    }

    // Listen for click events (desktop)
    document.addEventListener('click', blurActiveInput);

    // Listen for touchstart events (mobile devices)
    document.addEventListener('touchstart', blurActiveInput);

    const menuScreen = document.getElementById("menuScreen");
    const loginForm = document.getElementById("loginForm");
    const userIdInput = document.getElementById("userId");
    const passwordInput = document.getElementById("activationPassword");
    const userIdError = document.getElementById("userIdError");
    const passwordError = document.getElementById("passwordError");

    // Activation password for validation
    const activationPassword = "rjUVR2stK8L9gRi";

    loginForm.addEventListener("submit", function (e) {
        e.preventDefault(); // Prevent form submission

        // Clear previous error messages
        userIdError.textContent = "";
        passwordError.textContent = "";

        let valid = true;

        // Validate Megapari User ID
        if (userIdInput.value.trim() === "") {
            userIdError.textContent = "Please enter your Megapari User ID.";
            valid = false;
        }

        // Validate Activation Password
        if (passwordInput.value !== activationPassword) {
            passwordError.textContent = "Incorrect activation password.";
            valid = false;
        }

        if (valid) {
            // Fade out the menu screen
            menuScreen.classList.add("hidden");

            // Optionally, remove the menu screen from the DOM after the animation
            setTimeout(() => {
                menuScreen.style.display = "none";
            }, 500); // Duration matches the CSS transition
        }
    });
});
