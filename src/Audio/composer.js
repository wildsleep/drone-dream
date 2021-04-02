import * as Tone from 'tone';
import StartAudioContext from 'startaudiocontext';
import store, { observeStore } from 'Store/store';
import * as logger from 'Util/logger';
// import impulse from './EchoThiefImpulseResponseLibrary/Recreation/Natatorium.wav';
// import impulse from './EchoThiefImpulseResponseLibrary/Miscellaneous/CastilloDeLosTresReyesDelMorroSalasDeExposicion.wav';
import impulse from './EchoThiefImpulseResponseLibrary/Brutalism/LoveLibrary.wav';

const voiceCount = 3;

export default function initFirst() {
	StartAudioContext(Tone.context).then(() => {
		logger.log('composer', 'Audio context available.');
		init();			
	});
}

function init() {
	observeStore(state => state.playback.playing, handlePlayingChange);
}

let nodes;
function handlePlayingChange(playing, previousPlaying) {
	if (playing) {
		logger.log('composer', 'Starting playback.');
		const players = [...Array(voiceCount)].fill().map(_ => new Tone.Player());
		nodes = initVoices(players);
		logger.log('composer', 'Voices initialized.');
		startPlayback(players);
	} else if (previousPlaying) {
		logger.log('composer', 'Stopping playback.');
		stopPlayback();
		for (let node of nodes) {
			node.dispose();
		}
	}
}

function initVoices(players) {
	const nodes = [];
	let t;

	// reverb
	logger.log('composer', 'Initializing reverb...');
	t = Date.now();
	const reverb = new Tone.Convolver(impulse);
	nodes.push(reverb);
	logger.log('composer', `...done [${Date.now() - t}ms]`);

	players.forEach((player, i) => {
		nodes.push(player);

		player.fadeIn = 2;
		player.fadeOut = 2;
		player.sync();

		logger.log('composer', 'Initializing EQ...');
		t = Date.now();
		const voiceEq1 = new Tone.Filter(87, 'highpass', -24);
		const voiceEq2 = new Tone.Filter(964, 'highshelf', -24);
		voiceEq2.gain.value = -7.85;
		const voiceEq3 = new Tone.Filter(8500, 'lowpass', -24);
		voiceEq3.Q.value = 1.13;
		// const voiceEq4 = new Tone.EQ3(0, -17, -27.2);
		// voiceEq4.lowFrequency.value = 250;
		// voiceEq4.highFrequency.value = 2270;
		nodes.push(voiceEq1, voiceEq2, voiceEq3);
		logger.log('composer', `...done [${Date.now() - t}ms]`);

		// // compressor
		// // const compressor = new Tone.Compressor( [ threshold ] , 4.2);

		// // resonators
		// logger.log('composer', 'Initializing resonators...');
		// t = Date.now();
		// const resonators = Tone.Frequency('A1').harmonize([0, +12, -5, +5, +7])
		// 	.map(freq => new Tone.LowpassCombFilter(freq.toSeconds(), 0.8, 900));
		// const resonatorGain = new Tone.Gain(-30, 'decibels');
		// nodes.push(...resonators, resonatorGain);
		// logger.log('composer', `...done [${Date.now() - t}ms]`);

		// filter delay
		logger.log('composer', 'Initializing filter delay...');
		t = Date.now();
		const filterDelaySplit = new Tone.Split();
		nodes.push(filterDelaySplit);

		const filterDelayLFilter = new Tone.Filter(3320, 'bandpass');
		filterDelayLFilter.Q.value = 0.75;
		const filterDelayLDelay = new Tone.Delay(0.235);
		const filterDelayLFeedback = new Tone.Gain(0.46);
		const filterDelayLGain = new Tone.Gain(-6.4, 'decibels');
		nodes.push(filterDelayLFilter, filterDelayLDelay, filterDelayLFeedback, filterDelayLGain);

		const filterDelayRFilter = new Tone.Filter(5330, 'bandpass');
		filterDelayLFilter.Q.value = 1.75;
		const filterDelayRDelay = new Tone.Delay(0.219);
		const filterDelayRFeedback = new Tone.Gain(0.6);
		const filterDelayRGain = new Tone.Gain(-5.4, 'decibels');
		nodes.push(filterDelayRFilter, filterDelayRDelay, filterDelayRFeedback, filterDelayRGain);

		const filterDelayLRFilter = new Tone.Filter(290, 'bandpass');
		filterDelayLRFilter.Q.value = 2.25;
		const filterDelayLRDelay = new Tone.Delay(0.633);
		const filterDelayLRFeedback = new Tone.Gain(0.6);
		const filterDelayLRGain = new Tone.Gain(-8, 'decibels');
		nodes.push(filterDelayLRFilter, filterDelayLRDelay, filterDelayLRFeedback, filterDelayLRGain);

		const filterDelayMerge = new Tone.Merge();
		const filterDelayGain = new Tone.Gain();
		nodes.push(filterDelayMerge, filterDelayGain);
		logger.log('composer', `...done [${Date.now() - t}ms]`);

		// pan
		logger.log('composer', 'Initializing panner...');
		t = Date.now();
		const panner = new Tone.Panner();
		const panLfo = new Tone.LFO(1/10, -0.75, 0.75);
		panLfo.phase = 360 / (players.length || 1) * i
		panLfo.sync().start(0);
		panLfo.connect(panner.pan);
		nodes.push(panner, panLfo);
		logger.log('composer', `...done [${Date.now() - t}ms]`);

		// chaining

		logger.log('composer', 'Connecting nodes...');
		t = Date.now();
		Tone.connectSeries(player, voiceEq1, voiceEq2, voiceEq3);

		voiceEq3.connect(filterDelaySplit);
		voiceEq3.connect(filterDelayLRFilter);

		// voiceEq3.fan(...resonators);
		// for (let resonator of resonators) {
		// 	resonator.connect(resonatorGain);
		// }
		// resonatorGain.connect(filterDelaySplit);
		// resonatorGain.connect(filterDelayLRFilter);

		filterDelaySplit.connect(filterDelayLFilter, 0);
		filterDelaySplit.connect(filterDelayRFilter, 1);
		Tone.connectSeries(filterDelayLFilter, filterDelayLDelay, filterDelayLFeedback, filterDelayLFilter);
		Tone.connectSeries(filterDelayRFilter, filterDelayRDelay, filterDelayRFeedback, filterDelayRFilter);
		Tone.connectSeries(filterDelayLRFilter, filterDelayLRDelay, filterDelayLRFeedback, filterDelayLRFilter);
		filterDelayLFilter.connect(filterDelayGain);
		filterDelayRFilter.connect(filterDelayGain);
		filterDelayLRFilter.connect(filterDelayGain);
		Tone.connectSeries(filterDelayGain, panner, reverb);

		logger.log('composer', `...done [${Date.now() - t}ms]`);
	});

	reverb.toDestination();

	return nodes;
}

function startPlayback(players) {
	function scheduleVoiceStart(i) {
		if (playNewSlice(players[i])) {
			logger.log('composer', `Started voice ${i}.`)
			if (i + 1 < players.length) {
				Tone.Transport.scheduleOnce(() => {
					scheduleVoiceStart(i + 1);
				}, '+2.5');
			}
		} else {
			logger.log('composer', `Waiting to start voice ${i}.`);
			Tone.Transport.scheduleOnce(() => {
				scheduleVoiceStart(i);
			}, '+2.5');
		}
	}
	scheduleVoiceStart(0);

	Tone.Transport.start();
}

function playNewSlice(player) {
	const sample = getRandomSample();
	if (!sample) {
		logger.log('composer', 'No samples available.');
		return false;
	}

	const slice = getRandomSlice(sample.buffer, { minStartPercentage: 0.25, minDuration: 8, maxDuration: 8 });
	player.buffer = slice;
	player.start('+0.1');
	logger.log('composer', `Playing sample slice ${sample.audioUrl}`);

	Tone.Transport.scheduleOnce(() => {
		player.stop();
		playNewSlice(player);
	}, `+${slice.duration+0.1}`);
	return true;
}

function stopPlayback() {
	Tone.Transport.stop();
	Tone.Transport.cancel();
}

function getRandomSample() {
	const samples = Object.values(store.getState().audio.samples)
		.filter(x => x.buffer != null);
	if (!samples.length) return null;
	return samples[Math.floor(Math.random() * samples.length)];
}

function getRandomSlice(buffer, { minStartPercentage = 0, minDuration = 10, maxDuration = 30 }) {
	let minStart = minStartPercentage * buffer.duration;
	const duration = rand(minDuration, maxDuration);
	const maxStart = buffer.duration - duration;
	if (minStart > maxStart) {
		minStart = maxStart;
	}
	const start = rand(minStart, maxStart);
	const end = start + duration;
	return buffer.slice(start, end);
}

function rand(min, max) {
	return Math.random() * (max - min) + min;
}
