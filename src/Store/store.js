import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';

const store = configureStore({
	reducer: rootReducer,
	middleware: getDefaultMiddleware({
		serializableCheck: false,
	}),
	devTools: {
		actionsBlacklist: ['audio/bufferingProgress']
	}
});

if (process.env.NODE_ENV === 'development' && module.hot) {
	module.hot.accept('./rootReducer', () => {
		import('./rootReducer').then(module => {
			const newRootReducer = module.default;
			store.replaceReducer(newRootReducer);
		});
	});
}

export default store;

export function observeStore(select, onChange) {
	let currentState;

	function handleChange() {
		const nextState = select(store.getState());
		if (nextState !== currentState) {
			onChange(nextState, currentState);
			currentState = nextState;
		}
	}

	const unsubscribe = store.subscribe(handleChange);
	handleChange();
	return unsubscribe;
}
