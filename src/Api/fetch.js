import * as logger from 'Util/logger';

export function fetch(url, options = {}) {
	logger.log('fetch', `Fetching:`, url, options);
	return global.fetch(url, options);
}

export function checkStatus(res) {
	if (res.status >= 200 && res.status < 300) {
		return res;
	} else {
		const err = new Error(res.statusText);
		err.response = res;
		throw err;
	}
}

export function parseJson(res) {
	return res.json();
}

export function progress(onProgress) {
	return async (res) => {
		const reader = res.body.getReader();
		const contentLength = +res.headers.get('Content-Length');

		let position = 0;
		const received = new Uint8Array(contentLength);

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			received.set(value, position);
			position += value.length;
			onProgress(position, contentLength);
		}

		return received;
	};
}
