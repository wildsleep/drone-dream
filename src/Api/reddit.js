import queryString from 'query-string';
import { fetch, checkStatus, parseJson } from './fetch.js';

let token;

function fetchWithBasicAuth(url, options = {}) {
	return fetch(url, {
		...options,
		headers: {
			Authorization: `Basic ${Buffer.from('7z4m05dnP8KC1w:').toString('base64')}`,
			'User-Agent': `${process.env.REACT_APP_NAME} v${process.env.REACT_APP_VERSION} by ${process.env.REACT_APP_AUTHOR}`
		}
	});	
}

function fetchWithTokenAuth(url, options = {}) {
	return fetch(url, {
		...options,
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
}

// curl -X POST -u 7z4m05dnP8KC1w: -A "drone_dream v1.0.0 by /u/wildsleep" -d grant_type=https://oauth.reddit.com/grants/installed_client -d device_id=DO_NOT_TRACK_THIS_DEVICE https://www.reddit.com/api/v1/access_token

async function authorize() {
	return fetchWithBasicAuth('https://www.reddit.com/api/v1/access_token', {
		method: 'POST',
		body: new URLSearchParams({
			grant_type: 'https://oauth.reddit.com/grants/installed_client',
			device_id: 'DO_NOT_TRACK_THIS_DEVICE'
		})
	})
		.then(checkStatus)
		.then(parseJson)
		.then(data => {
			token = data.access_token;
		});
}

// async function deauthorize() {
// 	return fetchWithBasicAuth('https://www.reddit.com/api/v1/revoke_token', {
// 		method: 'POST',
// 		body: new URLSearchParams({
// 			token,
// 			token_type_hint: 'access_token'
// 		})
// 	})
// 		.then(checkStatus)
// 		.then(() => {
// 			token = null;
// 		});
// }

function withAuthorization(fn) {
	return async (...args) => {
		if (token) {
			try {
				const result = await fn(...args);
				return result;
			} catch (err) {
				if (err.response.status === 401) {
					token = null;
				} else {
					throw err;
				}
			}
		}

		await authorize();
		return fn(...args);
	};
}

function findSoundgasmUrls(post) {
	const re = /https?:\/\/soundgasm\.net\/u\/([-\w]+)\/([-\w]+)/g;
	if (post.is_self) {
		const matches = post.selftext.match(re);
		return matches ? [...new Set(matches)] : [];
	} else if (re.test(post.url)) {
		return [post.url];
	} else {
		return [];
	}
}

function parsePost(json) {
	const { id, url, subreddit, title, selftext, author, created, ups } = json.data;
	const soundgasmUrls = findSoundgasmUrls(json.data);
	return { id, url, subreddit, title, selftext, author, created, ups, soundgasmUrls };
}

function parsePostListing(json) {
	const { after, children } = json.data;
	return {
		after,
		children: children.map(parsePost)
	};
}

// curl -X GET -H "Authorization: Bearer -eNvJ17gNDZA1SLjA5wDCr-2fUxg" -A "drone_dream v1.0.0 by /u/wildsleep" -d grant_type=https://oauth.reddit.com/grants/installed_client -d device_id=DO_NOT_TRACK_THIS_DEVICE "https://oauth.reddit.com/r/gonewildaudible/search?q=f4m&limit=100&restrict_sr=true&include_over_18=true&raw_json=1"

export const search = withAuthorization(async ({ subreddit, ...options }) => {
	const url = `https://oauth.reddit.com/${subreddit ? `r/${subreddit}/` : ''}search`;
	return fetchWithTokenAuth(url + '?' + queryString.stringify({
		raw_json: true,
		restrict_sr: !!subreddit,
		include_over_18: true,
		...options
	}))
		.then(checkStatus)
		.then(parseJson)
		.then(parsePostListing)
});

export const hot = withAuthorization(async ({ subreddit, ...options }) => {
	const url = `https://oauth.reddit.com/${subreddit ? `r/${subreddit}/` : ''}hot`;
	return fetchWithTokenAuth(url + '?' + queryString.stringify({
		raw_json: true,
		restrict_sr: !!subreddit,
		include_over_18: true,
		...options
	}))
		.then(checkStatus)
		.then(parseJson)
		.then(parsePostListing)
});
