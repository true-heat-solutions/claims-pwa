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
		'/js/std-js/deprefixer.js',
		'/js/std-js/shims.js',
		'/js/std-js/md5.js',
		'/js/std-js/Notification.js',
		'/js/std-js/webShareApi.js',
		'/js/std-js/esQuery.js',
		'/js/std-js/functions.js',
		'/css/core-css/rem.css',
		'/css/core-css/viewport.css',
		'/css/core-css/element.css',
		'/css/core-css/class-rules.css',
		'/css/core-css/utility.css',
		'/css/core-css/fonts.css',
		'/css/core-css/animations.css',
		'/css/normalize.css/normalize.css',
		'/css/animate.css/animate.css',
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
