'use strict';
// 2019-06-11 12:25
const config = {
	version: location.hostname === 'localhost' ? new Date().toISOString() : '1.0.0',
	stale: [
		'/',
		'/js/index.js',
		'/js/share-button.js',
		'/js/share-config.js',
		'/js/gravatar-img.js',
		'/js/current-year.js',
		'/js/imgur-img.js',
		'/js/share-config.js',
		'/css/styles/index.css',
		'/css/styles/vars.css',
		'/css/styles/layout.css',
		'/css/styles/header.css',
		'/css/styles/nav.css',
		'/css/styles/main.css',
		'/css/styles/sidebar.css',
		'/css/styles/footer.css',
		'/img/favicon.svg',
		'/img/icons.svg',
		'/img/apple-touch-icon.png',
		'/img/logos/creative-common-by-sa.svg',
		'/img/octicons/mail.svg',
		'https://cdn.kernvalley.us/js/std-js/deprefixer.js',
		'https://cdn.kernvalley.us/js/std-js/shims.js',
		'https://cdn.kernvalley.us/js/std-js/md5.js',
		'https://cdn.kernvalley.us/js/std-js/Notification.js',
		'https://cdn.kernvalley.us/js/std-js/webShareApi.js',
		'https://cdn.kernvalley.us/js/std-js/esQuery.js',
		'https://cdn.kernvalley.us/js/std-js/functions.js',
		'https://cdn.kernvalley.us/css/core-css/rem.css',
		'https://cdn.kernvalley.us/css/core-css/viewport.css',
		'https://cdn.kernvalley.us/css/core-css/element.css',
		'https://cdn.kernvalley.us/css/core-css/class-rules.css',
		'https://cdn.kernvalley.us/css/core-css/utility.css',
		'https://cdn.kernvalley.us/css/core-css/fonts.css',
		'https://cdn.kernvalley.us/css/core-css/animations.css',
		'https://cdn.kernvalley.us/css/normalize.css/normalize.css',
		'https://cdn.kernvalley.us/css/animate.css/animate.css',
	].map(path => new URL(path, location.origin).href),
};

self.addEventListener('install', async () => {
	const cache = await caches.open(config.version);
	const keys = await caches.keys();
	const old = keys.filter(k => k !== config.version);
	await Promise.all(old.map(key => caches.delete(key)));

	await cache.addAll(config.stale);
	skipWaiting();
});

self.addEventListener('activate', event => {
	event.waitUntil(async function() {
		clients.claim();
	}());
});

self.addEventListener('fetch', async event => {
	async function get(request) {
		const cache = await caches.open(config.version);
		const cached = await cache.match(request);

		return cached instanceof Response ? cached : fetch(request);
	}

	if (event.request.method === 'GET' && config.stale.includes(event.request.url)) {
		event.respondWith(get(event.request));
	}
});
