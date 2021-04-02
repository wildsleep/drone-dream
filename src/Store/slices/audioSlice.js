import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
	name: 'audio',
	initialState: {
		samples: {},
		sizeLimit: 2e8,
		samplesLimit: 3
	},
	reducers: {
		bufferingStart(state, action) {
			const { audioUrl, size, parent } = action.payload;
			state.samples[audioUrl] = {
				audioUrl,
				buffer: null,
				bufferingStartedAt: Date.now(),
				size,
				parent
			};
		},
		bufferingProgress(state, action) {
			const { audioUrl, loaded } = action.payload;
			state.samples[audioUrl].loaded = loaded;
		},
		bufferingFinish(state, action) {
			const { audioUrl, buffer } = action.payload;
			state.samples[audioUrl].buffer = buffer;
			state.samples[audioUrl].bufferingFinishedAt = Date.now();
		},
		bufferingError(state, action) {
			const { audioUrl } = action.payload;
			delete state.samples[audioUrl];
		},
		removeSample(state, action) {
			const { audioUrl } = action.payload;
			delete state.samples[audioUrl];
		}
	}
});

export const { bufferingStart, bufferingProgress, bufferingFinish, bufferingError, removeSample } = slice.actions;
export default slice.reducer;
