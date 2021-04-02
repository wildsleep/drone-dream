import React from 'react';
import BasicControls from './BasicControls';
import SearchOptions from './SearchOptions';
import DebugMenu from './DebugMenu';
import styles from './App.module.css';

function App() {
	const enableDebug = window.location.search === '?debug';

	return (
		<div className={styles.root}>
			<BasicControls />
			<SearchOptions />
			{enableDebug && <DebugMenu />}
		</div>
	);
}

export default App;
