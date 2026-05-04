const hoverFilter = 'saturate(2) sepia(0.4) contrast(1.3)';
let currentAudio = null;

const skipContainer = document.getElementById('skip');
const skipButton = document.getElementById('skipButton');
const skipText = document.getElementById('skipText');
const xButton = document.getElementById('xButton');

// Difficulty configuration
// Change DIFFICULTY to 'easy', 'normal', or 'hard', or tweak values directly in the preset objects below.
const DIFFICULTY = 'normal';

const DIFFICULTY_PRESETS = {
	easy: {
		skipCooldownMs: 2500,       // How long between skip attempts
		escalation1Attempts: 2,     // Skip attempts before stage 1 (guilt video)
		escalation2Attempts: 4,     // Skip attempts before stage 2 (x button unlocked)
	},
	normal: {
		skipCooldownMs: 4000,
		escalation1Attempts: 3,
		escalation2Attempts: 6,
	},
	hard: {
		skipCooldownMs: 5500,
		escalation1Attempts: 4,
		escalation2Attempts: 8,
	},
};

const config = DIFFICULTY_PRESETS[DIFFICULTY];

// Media
const guiltAudioPath = './guilt_audio.mp3';
const mainAdFinishTimeSeconds = 160;
const guiltAdStartTimeSeconds = 170;

// Skip action globals
const skipAttemptCooldownMs = config.skipCooldownMs;
let lastSkipTimestamp = undefined;
let currentSkipString = "Skip";
let cooldownIntervalId = null;
let cooldownTimeoutId = null;

// Escalations
let skipAttempts = 0;
let escalation = 0;

// Escalation stage 1
const escalationFirstStageAttempts = config.escalation1Attempts;
const escalationFirstStageString = "Why skip us?"

//Escalation stage 2
const escalationSecondStageAttempts = config.escalation2Attempts;
let guiltAdPlaying = false;

(function (window, document) {

	// Listen for messages from the game shell
	window.addEventListener('message', (event) => {
		if (!event.data || !event.data.type) return;

		if (event.data.type === 'adStarted') {
			skipAttempts = 0;
			escalation = 0;
			skipContainer.style.display = 'block';

			// Our video "hack": the end of the first portion of the video should cause a skip fail, just as if the viewer had watched to the end of a normal ad
			// If they escalated to the point of watching the guilt video, however, don't cause a skip fail.
			// At the end of the guilt video, the adFinished event will trigger like normal. 
			setTimeout(() => {
				mainAdFinished();
			}, mainAdFinishTimeSeconds * 1000);
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

	// Mouse enter and leave triggers on the bigger container, click only works on the hidden smaller button inside.
	skipContainer.addEventListener('mouseenter', () => {
		setVideoFilter(hoverFilter);
	});

	skipContainer.addEventListener('mouseleave', () => {
		setVideoFilter('');
	});

	skipButton.addEventListener('click', handleButtonClick);

	xButton.addEventListener('click', adSuccess);
})(window, document);

// This is how you tell the parent window that the ad was successfully skipped.
function adSuccess() {
	window.top.postMessage({ type: 'success' }, '*');
}

function adFail() {
	window.top.postMessage({ type: 'fail' }, '*');
}

function setVideoFilter(value) {
	window.top.postMessage({ type: 'setVideoFilter', value }, '*');
}

function handleButtonClick(event){
	// Handle cooldowns
	// If they're on cooldown, tell them and don't do anything else.
	if (lastSkipTimestamp && event.timeStamp - lastSkipTimestamp < skipAttemptCooldownMs){
		showRateLimitMessage(event.timeStamp);
		return;
	}

	// They're not on cooldown, so do a successful skip attempt and start a cooldown
	lastSkipTimestamp = event.timeStamp;
	showRateLimitMessage(event.timeStamp);

	// Handle Escalations
	escalation = incrementEscalation(1);

	// Escalation 0
	// Just play audio
	if (escalation == 0){
		playGuiltAudio();
	}

	// Escalation 1
	// "Play" (seek to) guilt video
	// Change button text
	if (escalation == 1) {
		if (!guiltAdPlaying){
			window.top.postMessage({ type: 'seekTo', value: guiltAdStartTimeSeconds }, "*")
			guiltAdPlaying = true;
		}

		currentSkipString = escalationFirstStageString;
		skipText.innerHTML = escalationFirstStageString;
	}

	// Escalation 2
	// Disable button functionality
	// Show the x button that skips
	if (escalation == 2) {
		skipButton.removeEventListener('click', handleButtonClick);
		skipText.textContent = "Skip Enabled"
		xButton.style.display = "block";
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
	// By watching this short advertisement, you are helping support a small buisiness. Thank you.
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

function clearCooldownTimers() {
	if (cooldownIntervalId !== null) {
		clearInterval(cooldownIntervalId);
		cooldownIntervalId = null;
	}

	if (cooldownTimeoutId !== null) {
		clearTimeout(cooldownTimeoutId);
		cooldownTimeoutId = null;
	}
}

function showRateLimitMessage(timestamp){
	clearCooldownTimers();

	const updateCooldownText = () => {
		const cooldownRemaining = Math.max(0, skipAttemptCooldownMs - (performance.now() - lastSkipTimestamp));
		const cooldownRemainingSeconds = (cooldownRemaining / 1000).toFixed(1);
		skipText.textContent = cooldownRemaining > 0
			? `Wait ${cooldownRemainingSeconds}...`
			: currentSkipString;
	};

	updateCooldownText();

	cooldownIntervalId = setInterval(() => {
		updateCooldownText();
	}, 100);

	const cooldownRemaining = Math.max(0, skipAttemptCooldownMs - (performance.now() - lastSkipTimestamp));
	cooldownTimeoutId = setTimeout(() => {
		clearCooldownTimers();
		skipText.textContent = currentSkipString;
	}, cooldownRemaining);
}

function mainAdFinished(){
	// console.log(`escalattion to ${escalation} when checking for main ad finished`)
	// If the viewer didn't escalate, the ad should "end" like normal.
	// Pause to make sure they don't accidentally make it to the guilt portion.
	if (escalation == 0){
		window.top.postMessage({type: 'pause'}, '*');
		adFail();
	}

	// If the viewer DID escalate to watching the guilt video, don't do anything.
	// Once the guilt video ends, the game will post adFinished and the event handler will get it.
}