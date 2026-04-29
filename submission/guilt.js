(function (window, document) {
	// This is how you tell the parent window that the ad was successfully skipped.
	function adSuccess() {
		window.top.postMessage({ type: 'success' }, '*');
	}

	const skipButton = document.getElementById('skip');
	//const guiltAudioPath = './skip-audio.mp3';
	const guiltAudioPath = './CottonEyeJoe.mp3';

	const hoverFilter = 'saturate(2) sepia(0.4) contrast(1.3)';
	let skipAttempts = 0;
	let currentAudio = null;

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

	// Listen for messages from the game shell
	window.addEventListener('message', (event) => {
		if (!event.data || !event.data.type) return;

		if (event.data.type === 'adStarted') {
			skipAttempts = 0;
			skipButton.classList.remove('escalated');
			skipButton.style.display = 'block';
		}

		// By default, if the user doesn't "skip" the ad before the video ends,
		// we call fail to restart. You're welcome to replace this with a survey
		// or other interaction instead (see examples/survey).
		if (event.data.type === 'adFinished') {
			skipButton.style.display = 'none';
			setVideoFilter('');
			window.top.postMessage({ type: 'fail' }, '*');
		}
	});

	skipButton.addEventListener('mouseenter', () => {
		setVideoFilter(hoverFilter);
	});

	skipButton.addEventListener('mouseleave', () => {
		setVideoFilter('');
	});

	skipButton.addEventListener('click', () => {
		skipAttempts += 1;

		if (skipAttempts >= 3) {
			skipButton.classList.add('escalated');
		}

		if (skipAttempts > 5) {
			adSuccess();
			return;
		}

		playGuiltAudio();
	});

})(window, document);