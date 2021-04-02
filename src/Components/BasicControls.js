import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { togglePlaying } from 'Store/slices/playbackSlice';
import PlayStopButton from './PlayStopButton';
import SettingsButton from './SettingsButton';
import styles from './BasicControls.module.css';

export default function BasicControls() {
	const dispatch = useDispatch();
	const playing = useSelector(state => state.playback.playing);

	return (
		<section className={styles.root}>
			<PlayStopButton className={styles.button} playing={playing} size={120} onClick={() => dispatch(togglePlaying())} />
			{playing && <SettingsButton className={styles.button} size={100} />}
		</section>
	);
}
