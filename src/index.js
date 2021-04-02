import './index.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import store from 'Store/store';
import initBufferer from 'Audio/bufferer';
import initComposer from 'Audio/composer';
import * as serviceWorker from './serviceWorker';

function render() {
	import('Components/App').then(module => {
		const App = module.default;
		ReactDOM.render((
			<Provider store={store}>
				<App />
			</Provider>
		), document.getElementById('root'));
	});
}

render();
initBufferer();
initComposer();

if (process.env.NODE_ENV === 'development' && module.hot) {
	module.hot.accept('Components/App', render);
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
