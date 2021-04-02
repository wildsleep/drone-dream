import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
	name: 'logger',
	initialState: [
		'bufferer',
		'composer',
	],
	reducers: {
		enableLogging(state, action) {
			const { module } = action.payload;
			state.push(module);
		},

		disableLogging(state, action) {
			const { module } = action.payload;
			const index = state.indexOf(module);
			if (index !== -1) {
				state.splice(index, 1);
			}
		},
	},
});

export default slice.reducer;
