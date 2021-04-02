import { createSlice } from '@reduxjs/toolkit';
import { addSearchResults } from './searchesSlice';

const slice = createSlice({
	name: 'reddit',
	initialState: {},
	extraReducers: {
		[addSearchResults](state, action) {
			const { posts } = action.payload;
			for (let post of posts) {
				state[post.id] = post;
			}
		},
	}
});

export default slice.reducer;
