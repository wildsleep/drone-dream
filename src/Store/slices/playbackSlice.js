import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
	name: 'playback',
	initialState: {
		playing: false
	},
	reducers: {
		play(state, action) {
			state.playing = true;
		},

		stop(state, action) {
			state.playing = false;
		},

		togglePlaying(state, action) {
			state.playing = !state.playing;
		},
	}
});

export const { play, stop, togglePlaying } = slice.actions;
export default slice.reducer;
