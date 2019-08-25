import {ready} from '/js/std-js/functions.js';
import Router from './Router.js';

const router = new Router({
	'': () => router.go('login'),
	logout: async () => {
		sessionStorage.clear();
		router.go('login');
	},
});

window.addEventListener('hashchange', async () => await router.go(...location.hash.substring(1).split('/')));

ready().then(async () => {
	if (location.hash === '') {
		router.go('login');
	} else if (location.hash.startsWith('#')) {
		await router.go(...location.hash.substring(1).split('/'));
	}
});
