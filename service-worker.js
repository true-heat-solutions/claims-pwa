'use strict';
/*eslint no-undef: 0*/
/* 2019-10-18T12:48 */
self.importScripts('/config.js');

self.addEventListener('install', async event => {
	event.waitUntil((async () => {
		try {
			for (const key of await caches.keys()) {
				await caches.delete(key);
			}

			const cache = await caches.open(config.version);
			await cache.addAll(config.stale);
		} catch (err) {
			console.error(err);
		}
	})());
});

self.addEventListener('activate', event => event.waitUntil(clients.claim()));

self.addEventListener('fetch', event => {
	if (event.request.method === 'GET' && event.request.url.startsWith(location.origin)) {
		event.respondWith((async () => {
			const url = new URL(event.request.url);
			url.hash = '';

			if (Array.isArray(config.stale) && config.stale.includes(url.href)) {
				const cached = await caches.match(url);
				if (cached instanceof Response) {
					return cached;
				}
			} else if (Array.isArray(config.fresh) && config.fresh.includes(url.href)) {
				if (navigator.onLine) {
					const resp = await fetch(url.href);
					const cache = await caches.open(config.version);

					if (resp.ok) {
						cache.add(resp.clone());
					}
					return resp;
				} else {
					return caches.match(event.request);
				}
			} else if (Array.isArray(config.allowed) && config.allowed.some(host => new URL(event.request.url).host === host)) {
				const resp = await caches.match(event.request);
				if (resp instanceof Response) {
					return resp;
				} else if (navigator.onLine) {
					const resp = await fetch(event.request);
					const cache = await caches.open(config.version);
					cache.add(resp.clone());
					return resp;
				}
			} else {
				console.info(`Making request for ${event.request.url}`);
				return fetch(event.request.url);
			}
		})());
	}
});

self.addEventListener('error', console.error);
