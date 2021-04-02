import * as Tone from 'tone';
import { checkStatus, progress } from 'Api/fetch';
import { search, hot } from 'Api/reddit';
import { details } from 'Api/soundgasm';
import { bufferingStart, bufferingProgress, bufferingFinish, bufferingError } from 'Store/slices/audioSlice';
import { addSearchResults } from 'Store/slices/searchesSlice';
import { addPost } from 'Store/slices/soundgasmSlice';
import store, { observeStore } from 'Store/store';
import * as logger from 'Util/logger';

const defaultSearchBlacklist = [
	/\bsfw\b/i,
	/outtake/i,
	/disclaimer/i,
	/dd\/lg/i,
	/yandere/i,
	/music/i,
	/french/i
];

const defaultArtistBlacklist = [
	/^HeatherFuta$/
];

const bufferThreadCount = 3;

let abortController = null;

export default function init() {
	observeStore(state => state.playback.playing, handlePlayingChange);
}

function handlePlayingChange(playing) {
	if (playing) {
		logger.log('bufferer', 'Starting buffer process.');
		const searchOptions = store.getState().searchOptions;
		startBuffering(searchOptions);
	} else {
		stopBuffering();
	}
}

function matchesAny(list, text) {
	return list.some(item =>
		item instanceof RegExp ?
			item.test(text) :
			text.includes(item));
}

function startBuffering(searchOptions) {
	stopBuffering();
	abortController = new AbortController();
	const soundgasmIterator = soundgasmDetailsGenerator(searchOptions);
	for (let i = 0; i < bufferThreadCount; ++i) {
		bufferThread(`thread_${i}`, searchOptions, soundgasmIterator, abortController.signal);
	}
}

function stopBuffering() {
	if (abortController) {
		abortController.abort();
		abortController = null;
	}
}

async function bufferThread(id, searchOptions, soundgasmIterator, signal) {
	let isAborted = false;
	signal.addEventListener('abort', () => { 
		isAborted = true; 
	});

	while (!isAborted) {
		const { samples, sizeLimit, samplesLimit } = store.getState().audio;
		const totalSamples = Object.values(samples).length;
		if (totalSamples > samplesLimit) {
			logger.log('bufferer', `Sample limit reached; buffer thread ${id} exiting.`);
			break;
		}
		const totalBufferedSize = Object.values(samples).reduce((acc, sample) => acc + sample.size, 0);
		if (totalBufferedSize >= sizeLimit) {
			logger.log('bufferer', `Memory limit reached; buffer thread ${id} exiting.`);
			break;
		}

		const result = await soundgasmIterator.next();
		if (result.done) break;

		const { url, audioUrl } = result.value;
		if (store.getState().audio.samples[audioUrl]) continue;

		await fetchAudio(audioUrl, url, signal);
	}
}

async function fetchAudio(audioUrl, parent, signal) {
	return fetch(audioUrl, { referrer: '', signal })
		.then(checkStatus)
		.then(res => {
			const size = +res.headers.get('Content-Length');
			store.dispatch(bufferingStart({ audioUrl, size, parent }));
			return res;
		})
		.then(progress((loaded, total) => {
			store.dispatch(bufferingProgress({ audioUrl, loaded, total }))
		}))
		.then(arr => Tone.context.decodeAudioData(arr.buffer))
		.then(audioBuffer => {
			const buffer = new Tone.Buffer(audioBuffer);
			store.dispatch(bufferingFinish({ audioUrl, buffer }));
		})
		.catch(error => {
			logger.error('bufferer', error);
			store.dispatch(bufferingError({ audioUrl, error }));
		});
}

async function *soundgasmDetailsGenerator({
	subreddit,
	query,
	sort,
	searchBlacklist = defaultSearchBlacklist,
	artistBlacklist = defaultArtistBlacklist
}) {
	for await (let meta of redditSearchGenerator({ subreddit, query, sort, searchBlacklist, artistBlacklist })) {
		for (let url of meta.soundgasmUrls) {
			if (matchesAny(searchBlacklist, url)) continue;

			let soundgasmDetails;
			if (store.getState().soundgasm[url]) {
				soundgasmDetails = store.getState().soundgasm[url];
			} else {
				soundgasmDetails = await details(url);
				if (soundgasmDetails.error) continue;
				store.dispatch(addPost({ post: { ...soundgasmDetails, parent: meta.id } }));
			}

			if (matchesAny(searchBlacklist, soundgasmDetails.title)) continue;

			yield soundgasmDetails;
		}
	}
}

async function *redditSearchGenerator({ subreddit, query, sort, searchBlacklist, artistBlacklist }) {
	let after;
	do {
		const apiFn = query ? search : hot;
		const searchResults = await apiFn({
			subreddit,
			q: query,
			sort,
			limit: 100,
			after
		});

		store.dispatch(addSearchResults({
			id: JSON.stringify({ subreddit, query, sort }),
			after: searchResults.after,
			posts: searchResults.children
		}));

		for (let meta of searchResults.children) {
			if (!meta.soundgasmUrls.length) continue;
			if (matchesAny(searchBlacklist, meta.title)) continue;
			if (matchesAny(artistBlacklist, meta.author)) continue;
			yield meta;
		}

		after = searchResults.after;
	} while (after != null);
}
