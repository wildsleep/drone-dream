import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
	name: 'soundgasm',
	initialState: {},
	reducers: {
		addPost(state, action) {
			const { post } = action.payload;
			state[post.url] = post;
		},
	}
});

export const { addPost } = slice.actions;
export default slice.reducer;
