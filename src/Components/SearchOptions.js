import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTrail, a } from 'react-spring';
import { setQuery, setSubreddit } from 'Store/slices/searchOptionsSlice';
import styles from './SearchOptions.module.css';

export default function SearchOptions() {
	const dispatch = useDispatch();
	const show = useSelector(state => !state.playback.playing);
	const { query, subreddit } = useSelector(state => state.searchOptions);

	const labelSpring = useTrail(2, {
		to: {
			transform: `translate3d(${show ? 0 : 24}px,0,0)`,
			opacity: show ? 1 : 0
		}
	});

	return show && (
		<a.section className={styles.root}>
			<a.label style={labelSpring[0]}>
				<span className={styles.label}>Subreddit</span>
				<input type="text" spellCheck={false} value={subreddit} onChange={e => dispatch(setSubreddit({ subreddit: e.target.value }))} />
			</a.label>
			<a.label style={labelSpring[1]}>
				<span className={styles.label}>Search</span>
				<input type="text" spellCheck={false} value={query} onChange={e => dispatch(setQuery({ query: e.target.value }))} />
			</a.label>
		</a.section>
	);
}
