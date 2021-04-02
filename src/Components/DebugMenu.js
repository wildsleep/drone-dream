import React from 'react';
import { useSelector } from 'react-redux';
import styles from './DebugMenu.module.css';


export default function DebugMenu() {
	const [show, setShow] = React.useState(false);
	
	const reddit = useSelector(state => state.reddit);
	const soundgasm = useSelector(state => state.soundgasm);
	const audio = useSelector(state => state.audio);

	const samples = Object.values(audio.samples);
	const totalBufferedSize = samples.reduce((acc, sample) => acc + sample.size, 0);

	return (
		<React.Fragment>
			<button className={styles.showMenu} onClick={() => setShow(!show)}>Debug</button>
			{show && (
				<div className={styles.menu}>
					<h1>Memory usage</h1>
					{totalBufferedSize} / {audio.limit}
					<h1>Buffered samples</h1>
					<ul>
						{samples.map(sample => {
							const soundgasmMeta = soundgasm[sample.parent];
							const redditMeta = reddit[soundgasmMeta.parent];
							return (
								<li key={sample.audioUrl}>
									<dl>
										<dt>Audio</dt>
										<dd>{redditMeta.title} by {redditMeta.author}</dd>
										<dt>Buffered</dt>
										<dd>{sample.loaded} / {sample.size} ({(sample.loaded / sample.size * 100).toFixed(1)}%)</dd>
									</dl>
								</li>
							);
						})}
					</ul>
				</div>
			)}
		</React.Fragment>
	);
}