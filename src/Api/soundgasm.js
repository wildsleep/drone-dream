import { fetch, checkStatus } from './fetch.js';

const domParser = new DOMParser();

async function fetchSoundgasmPost(url) {
	return fetch(url.replace(/^https?:\/\/soundgasm.net/, process.env.REACT_APP_SOUNDGASM_PROXY), { referrer: '' })
		.then(checkStatus)
		.then(res => res.text())
		.then(html => domParser.parseFromString(html, 'text/html'));
}

function findTitle(dom) {
	const el = dom.querySelector('.jp-title');
	return el && el.innerText;
}

function findDescription(dom) {
	const el = dom.querySelector('.jp-description')
	return el && el.innerText.trim();
}

function findAuthor(url) {
	return url.match(/^https?:\/\/soundgasm.net\/u\/([-\w]+)/)[1];
}

function findAudioUrl(dom) {
	const el = dom.querySelector('script:not([src])');
	const match = el && el.innerText.match(/https?:\/\/media\.soundgasm\.net\/sounds\/\w+\.m4a/);
	return match && match[0].replace(/^https?:\/\/media\.soundgasm.net/, process.env.REACT_APP_SOUNDGASM_MEDIA_PROXY);
}

export async function details(url) {
	try {
		const dom = await fetchSoundgasmPost(url);
		return {
			url,
			audioUrl: findAudioUrl(dom),
			title: findTitle(dom),
			text: findDescription(dom),
			author: findAuthor(url),
		};
	} catch (err) {
		if (!err.response) {
			throw err;
		}
		return {
			error: err.response.status,
			errorMessage: err.response.statusText
		};
	}
}
