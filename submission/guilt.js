const hoverFilter = 'saturate(2) sepia(0.4) contrast(1.3)';
let currentAudio = null;

const skipContainer = document.getElementById('skip');
const skipButton = document.getElementById('skipButton');
//const guiltAudioPath = './skip-audio.mp3';
const guiltAudioPath = './CottonEyeJoe.mp3';

// Skip action globals
let skipAttempts = 0;
const skipAttemptCooldown = 1000; // miliseconds
let lastSkipTimestamp = undefined;

(function (window, document) {

	// Listen for messages from the game shell
	window.addEventListener('message', (event) => {
		if (!event.data || !event.data.type) return;

		if (event.data.type === 'adStarted') {
			skipAttempts = 0;
			skipContainer.classList.remove('escalated');
			skipContainer.style.display = 'block';
		}

		// By default, if the user doesn't "skip" the ad before the video ends,
		// we call fail to restart. You're welcome to replace this with a survey
		// or other interaction instead (see examples/survey).
		if (event.data.type === 'adFinished') {
			skipContainer.style.display = 'none';
			setVideoFilter('');
			window.top.postMessage({ type: 'fail' }, '*');
		}
	});

	// Mouse enter and leave triggers on the bigger container, click only works on the hidden smaller button inside. Funny but we can change it
	skipContainer.addEventListener('mouseenter', () => {
		setVideoFilter(hoverFilter);
	});

	skipContainer.addEventListener('mouseleave', () => {
		setVideoFilter('');
	});

	skipButton.addEventListener('click', (event) => {
		// Handle cooldowns
		// If they're on cooldown, don't do anything.
		if (lastSkipTimestamp && event.timeStamp - lastSkipTimestamp < skipAttemptCooldown){
			return;
		}

		// They're not on cooldown, so do a successful skip and start a cooldown
		lastSkipTimestamp = event.timeStamp;
		// showRateLimitMessage(event.timeStamp); //BROKEN

		// Handle attempts
		skipAttempts += 1;

		if (skipAttempts >= 3) {
			skipContainer.classList.add('escalated');
		}

		if (skipAttempts > 5) {
			adSuccess();
			return;
		}

		playGuiltAudio();
	});

	document.getElementById("debugpause").addEventListener('click', () => {window.top.postMessage({type: 'pause'}, '*')});
})(window, document);

// This is how you tell the parent window that the ad was successfully skipped.
function adSuccess() {
	window.top.postMessage({ type: 'success' }, '*');
}

function setVideoFilter(value) {
	window.top.postMessage({ type: 'setVideoFilter', value }, '*');
}

function playGuiltAudio() {
	if (currentAudio) {
		currentAudio.pause();
		currentAudio.currentTime = 0;
	}

	currentAudio = new Audio(guiltAudioPath);
	currentAudio.addEventListener('error', () => {
		// The asset may be absent while developing.
	}, { once: true });

	currentAudio.play().catch(() => {
		// Browser playback policies can block autoplay-style calls.
	});
}

function showRateLimitMessage(timestamp){
	console.log(`timestamp ${timestamp} ${typeof(timestamp)}`)
	const cooldownRemaining = skipAttemptCooldown - (timestamp - lastSkipTimestamp);
	const cooldownRemainingSeconds = (cooldownRemaining/1000).toFixed(1);
	skipContainer.innerHTML = `Wait ${cooldownRemainingSeconds}...`;
	console.log(`rate message update to ${cooldownRemaining}`)

	// Timeout loop for updating the counter
	//BROKEN: passing timestamp into here causes it to become NaN. probably memory shenanigans idk
	setTimeout((timestamp) => {
		// Return to normal skip and don't loop if the cooldown is over
		if (cooldownRemaining <= 0){
			skipContainer.innerHTML = "Skip";
			return;
		}

		// Cooldown not over, continue the loop
		showRateLimitMessage(timestamp + skipAttemptCooldown/10);
	}, skipAttemptCooldown/10);
}