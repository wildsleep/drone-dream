const proxy = require("http-proxy-middleware");

module.exports = app => {
	app.use('/soundgasm', proxy({
		target: "https://soundgasm.net",
		changeOrigin: true,
		pathRewrite: {
			"^/soundgasm": "/"
		},
		// onProxyReq(proxyReq, req, res) {
		// 	console.log(`Proxying request ${proxyReq.path}`);
		// }
	}));
	app.use('/soundgasm-media', proxy({
		target: "https://media.soundgasm.net",
		changeOrigin: true,
		pathRewrite: {
			"^/soundgasm-media": "/"
		},
		// onProxyReq(proxyReq, req, res) {
		// 	console.log(`Proxying request ${proxyReq.path}`);
		// }
	}));
};