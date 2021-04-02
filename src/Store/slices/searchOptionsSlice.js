import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
	name: 'searchOptions',
	initialState: {
		// query: 'paragraphs',
		// subreddit: 'recordings',
		query: 'f4m fdom mast',
		subreddit: 'gonewildaudio',
		sort: null
	},
	reducers: {
		setQuery(state, action) {
			const { query } = action.payload;
			state.query = query;
		},

		setSubreddit(state, action) {
			const { subreddit } = action.payload;
			state.subreddit = subreddit;
		},

		setOptions(state, action) {
			const { query, subreddit, sort } = action.payload;
			state.query = query;
			state.subreddit = subreddit;
			state.sort = sort;
		},
	}
});

export const { setQuery, setSubreddit, setOptions } = slice.actions;
export default slice.reducer;
