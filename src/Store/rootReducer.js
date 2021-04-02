import { combineReducers } from '@reduxjs/toolkit';
import audioReducer from './slices/audioSlice';
import loggerReducer from './slices/loggerSlice';
import playbackReducer from './slices/playbackSlice';
import redditReducer from './slices/redditSlice';
import searchesReducer from './slices/searchesSlice';
import searchOptionsReducer from './slices/searchOptionsSlice';
import soundgasmReducer from './slices/soundgasmSlice';

const rootReducer = combineReducers({
	audio: audioReducer,
	logger: loggerReducer,
	playback: playbackReducer,
	reddit: redditReducer,
	searches: searchesReducer,
	searchOptions: searchOptionsReducer,
	soundgasm: soundgasmReducer,
});

export default rootReducer;
