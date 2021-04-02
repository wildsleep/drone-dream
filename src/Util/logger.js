import store from 'Store/store';

export function log(module, ...message) {
	if (store.getState().logger.includes(module)) {
		console.log(`%c[${module}]`, 'font-weight: bold; color: blue', ...message);
	}
}

export function error(module, ...message) {
	if (store.getState().logger.includes(module)) {
		console.error(`%c[${module}]`, 'font-weight: bold', ...message);
	}
}