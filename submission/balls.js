(function (window, document) {
	// This is how you tell the parent window that the ad was successfully skipped.
	function adSuccess() {
		window.top.postMessage({ type: 'success' }, '*');
	}

	const skipButton = document.getElementById('skip');

	// Listen for messages from the game shell
	window.addEventListener('message', (event) => {
		if (!event.data || !event.data.type) return;

		if (event.data.type === 'adStarted') {
			// Show the skip button when the ad starts
			skipButton.style.display = 'block';
		}

		// By default, if the user doesn't "skip" the ad before the video ends,
		// we call fail to restart. You're welcome to replace this with a survey
		// or other interaction instead (see examples/survey).
		if (event.data.type === 'adFinished') {
			skipButton.style.display = 'none';
			window.top.postMessage({ type: 'fail' }, '*');
		}
	});

	// Your ad overlay code goes here, we've added a simple example below:
	skipButton.addEventListener('click', () => {
		skipButton.style.display = 'none';
		adSuccess();
	});

	document.getElementById("debugPause").addEventListener('click', () => window.top.postMessage({type: "pause"}, '*'))

	console.log(window.innerWidth);
	console.log(window.innerHeight);

	// Add deploy ball listener
	const ballButton = document.getElementById("debugAddBall");
	ballButton.addEventListener("click", () => {
		addBall(Math.random() * window.innerWidth, Math.random() * window.innerHeight);
	})

	// Begin tick loop
	// requestAnimationFrame(tick);
})(window, document);

class Ball{
	constructor(x, y, size, container){
		// Assuming x, y define the center of the visible element. probably wrong but will fix later
		this.x = x;
		this.y = y;
		this.size = size;

		// Create HTML element and store
		const newBall = document.createElement("div");
		newBall.className = "ball";
		this.element = newBall;

		// Put the ball in the document
		container.appendChild(newBall);
	}

	/**
	 * Updates this ball's visuals based on internal data.
	 * Generally should be called after all physics updates have been processed.
	 */ 
	updateVisual(){
		this.element.style.left = `${this.x}px`;
		this.element.style.bottom = `${this.y}px`;
		this.element.style.width = `${this.size}px`; // TODO: SHOULD SCALE WITH WINDOW SIZE. LIKE A MULTIPLIER.
		this.element.style.height = `${this.size}px`; // TODO: SHOULD SCALE WITH WINDOW SIZE. LIKE A MULTIPLIER.
	}
}

function addBall(x, y){
	const container = document.getElementById("ballContainer");
	const newBall = new Ball(x, y, Math.floor(Math.random() * 100 + 100), container);
	newBall.updateVisual();
	balls.push(newBall);
}

// Tick "parameters"
let prevTimestamp = undefined;
const balls = [];

function tick(timestamp){
	const delta = !prevTimestamp ? 0 : timestamp - prevTimestamp;
	prevTimestamp = timestamp;

	// console.log(delta);

	// Persist tick loop
	requestAnimationFrame(tick);
}
