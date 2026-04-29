const hoverFilter = 'saturate(2) sepia(0.4) contrast(1.3)';
let skipAttempts = 0;
let currentAudio = null;

const skipContainer = document.getElementById('skip');
const skipButton = document.getElementById('skipButton');
//const guiltAudioPath = './skip-audio.mp3';
const guiltAudioPath = './CottonEyeJoe.mp3';

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

	skipButton.addEventListener('click', () => {
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