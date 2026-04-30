const hoverFilter = 'saturate(2) sepia(0.4) contrast(1.3)';
let currentAudio = null;

const skipContainer = document.getElementById('skip');
const skipButton = document.getElementById('skipButton');
const skipText = document.getElementById('skipText');
//const guiltAudioPath = './skip-audio.mp3';
const guiltAudioPath = './CottonEyeJoe.mp3';

// Skip action globals
const skipAttemptCooldown = 3000; // miliseconds
let lastSkipTimestamp = undefined;

// Escalations
let skipAttempts = 0;
let escalation = 0;

// Escalation stage 1
const escalationFirstStageAttempts = 3;
const escalationFirstStageString = "Why skip us?"

//Escalation stage 2
const escalationSecondStageAttempts = 5;

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

	skipButton.addEventListener('click', handleButtonClick);

	document.getElementById("debugpause").addEventListener('click', () => {window.top.postMessage({type: 'pause'}, '*')});
})(window, document);

// This is how you tell the parent window that the ad was successfully skipped.
function adSuccess() {
	window.top.postMessage({ type: 'success' }, '*');
}

function setVideoFilter(value) {
	window.top.postMessage({ type: 'setVideoFilter', value }, '*');
}

function handleButtonClick(event){
	// Handle cooldowns
	// If they're on cooldown tell them and don't do anything else.
	if (lastSkipTimestamp && event.timeStamp - lastSkipTimestamp < skipAttemptCooldown){
		showRateLimitMessage(event.timeStamp);
		return;
	}

	// They're not on cooldown, so do a successful skip and start a cooldown
	lastSkipTimestamp = event.timeStamp;

	// Handle Escalations
	escalation = incrementEscalation(1);

	// Escalation 0
	// Just play audio
	if (escalation == 0){
		playGuiltAudio();
	}

	// Escalation 1
	// TODO: Play video
	// Change button text
	if (escalation == 1) {
		skipText.innerHTML = escalationFirstStageString;
	}

	// Escalation 2
	// Disable button functionality
	// Show the x button that skips?
	if (escalation == 2) {
		skipButton.removeEventListener('click', handleButtonClick)
	}
}

function incrementEscalation(incrementAmount){
	skipAttempts += incrementAmount;

	// I don't like this, but it works
	if (skipAttempts >= escalationSecondStageAttempts){
		return 2;
	}
	if (skipAttempts >= escalationFirstStageAttempts){
		return 1;
	}
	return 0;
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
	skipText.innerHTML = `Wait ${cooldownRemainingSeconds}...`;
	console.log(`rate message update to ${cooldownRemaining}`)

	// Change back to normal when cooldown is up
	// Definitely causes a race condition with itself if multiple clicks but whatever it's fine for this
	setTimeout(() => {
		skipText.textContent = "Skip";
	}, cooldownRemaining);
}