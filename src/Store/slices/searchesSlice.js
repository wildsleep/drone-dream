import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
	name: 'searches',
	initialState: {},
	reducers: {
		addSearchResults(state, action) {
			const { id, after, posts } = action.payload;
			const postIds = posts.map(post => post.id);
			if (state[id]) {
				state[id].after = after;
				state[id].posts.push(...postIds);
			} else {
				state[id] = { after, posts: postIds };
			}
		},
	}
});

export const { addSearchResults } = slice.actions;
export default slice.reducer;
