'use strict';

const config = {
	version: '1.0.0-a16',
	stale: [
		'/',
		'/js/index.js',
		'/js/consts.js',
		'/js/Router.js',
		'/js/current-year.js',
		'/components/pages/login.js',
		'/components/pages/login.html',
		'/components/error-message.js',
		'/components/error-message.html',
		'/components/toast-message.js',
		'/components/toast-message.html',
		'/components/claim-item.js',
		'/components/claim-item.html',
		'/components/attachment-el.js',
		'/components/attachment-el.html',
		'/components/user-el.js',
		'/components/user-el.html',
		'/components/pages/claims.js',
		'/components/pages/claims.html',
		'/components/pages/claims.json',
		'/components/pages/claim.js',
		'/components/pages/claim.html',
		'/components/pages/forgot-password.js',
		'/components/pages/forgot-password.html',
		'/components/pages/register.js',
		'/components/pages/register.html',
		'/components/pages/account.js',
		'/components/pages/account.html',
		'/components/pages/users.js',
		'/components/pages/users.html',
		'/components/pages/profile.js',
		'/components/pages/profile.html',
		'/components/app-footer.js',
		'/components/app-footer.html',
		'/components/logout-button.js',
		'/components/logo-img.js',
		'/components/logo-img.html',
		'/components/back-button.js',
		'/js/routes.js',
		'/js/std-js/deprefixer.js',
		'/js/std-js/shims.js',
		'/js/std-js/md5.js',
		'/js/std-js/Notification.js',
		'/js/std-js/asyncDialog.js',
		'/js/std-js/webShareApi.js',
		'/js/std-js/esQuery.js',
		'/js/std-js/functions.js',
		'/css/styles/index.css',
		'/css/styles/vars.css',
		'/css/styles/layout.css',
		'/css/styles/header.css',
		'/css/styles/nav.css',
		'/css/styles/main.css',
		'/css/styles/sidebar.css',
		'/css/styles/common.css',
		'/css/styles/footer.css',
		'/css/core-css/rem.css',
		'/css/core-css/viewport.css',
		'/css/core-css/element.css',
		'/css/core-css/class-rules.css',
		'/css/core-css/utility.css',
		'/css/core-css/fonts.css',
		'/css/core-css/animations.css',
		'/css/normalize/normalize.css',
		'/css/animate.css/animate.css',
		'/img/icons.svg',
		'/img/apple-touch-icon.png',
		'/img/icon-192.png',
		'/img/favicon.svg',
		'/fonts/roboto.woff2',
	].map(path => new URL(path, location.origin).href),
	fresh: [
		'https://cdn.polyfill.io/v2/polyfill.min.js?unknown=polyfill&features=es6,MutationObserver,IntersectionObserver,IntersectionObserverEntry,Object.values,Object.entries,NodeList.prototype.@@iterator,Array.prototype.@@iterator&flags=gated',
		'https://unpkg.com/@webcomponents/custom-elements@1.2.4/custom-elements.min.js',
	]
};

self.addEventListener('install', async () => {
	try {
		for (const key of await caches.keys()) {
			await caches.delete(key);
		}

		const cache = await caches.open(config.version);
		await cache.addAll(config.stale).catch(console.error);
	} catch (err) {
		console.error(err);
	}

	skipWaiting();
});

self.addEventListener('activate', event => {
	event.waitUntil(async function() {
		clients.claim();
	}());
});

self.addEventListener('fetch', event => {
	const url = new URL(event.request.url);
	url.hash = '';
	switch(event.request.method) {
	case 'GET':
		if (Array.isArray(config.stale) && config.stale.includes(url.href)) {
			event.respondWith((async () => {
				const cached = await caches.match(url);
				if (cached instanceof Response) {
					return cached;
				} else {
					return await fetch(event.request);
				}
			})());
		} else if (Array.isArray(config.fresh) && config.fresh.includes(url.href)) {
			event.respondWith((async () => {
				if (navigator.onLine) {
					const resp = await fetch(url.href);
					const cache = await caches.open(config.version);
					if (resp.ok) {
						cache.add(resp.clone());
					}
					return resp;
				} else {
					return await caches.match(event.request);
				}
			})());
		} else if (Array.isArray(config.allowed) && config.allowed.some(host => new URL(event.request.url).host === host)) {
			event.respondWith((async () => {
				const resp = await caches.match(event.request);
				if (resp instanceof Response) {
					return resp;
				} else if (navigator.onLine) {
					const resp = await fetch(event.request);
					const cache = await caches.open(config.version);
					cache.add(resp.clone());
					return resp;
				} else {
					return await fetch(event.request);
				}
			})());
		}
	}
});
