// import 'https://cdn.polyfill.io/v2/polyfill.min.js?unknown=polyfill&features=es6,MutationObserver,IntersectionObserver,IntersectionObserverEntry,Object.values,Object.entries,NodeList.prototype.@@iterator,Array.prototype.@@iterator&flags=gated';
// import 'https://unpkg.com/@webcomponents/custom-elements@1.2.4/custom-elements.min.js';
import {ENDPOINT} from './consts.js';
import './std-js/deprefixer.js';
import './std-js/shims.js';
// import './share-button.js';
import './current-year.js';
// import './gravatar-img.js';
// import './imgur-img.js';
import '../components/pages/login.js';
import '../components/error-message.js';
import '../components/toast-message.js';
import '../components/pages/claims.js';
import '../components/pages/account.js';
import '../components/pages/users.js';
import '../components/pages/forgot-password.js';
import '../components/pages/register.js';
import '../components/pages/profile.js';
import '../components/app-footer.js';
import '../components/logout-button.js';
import '../components/logo-img.js';
import '../components/back-button.js';
import './routes.js';
import {$, ready, registerServiceWorker} from './std-js/functions.js';

if (! navigator.hasOwnProperty('connection')) {

	navigator.connection = {
		type: 'unknown',
		effectiveType: '4g',
		rtt: NaN,
		downlink: NaN,
		downlinkMax: Infinity,
		saveData: false,
		onchange: null,
		ontypechange: null,
		addEventListener: () => null,
	};
}

function reportError({message, filename, colno, lineno}) {
	const data = new FormData();
	const url = new URL('/errors/', ENDPOINT);

	data.set('message', message);
	data.set('file', filename);
	data.set('column', colno);
	data.set('line', lineno);
	data.set('url', location.href);
	data.set('userAgent', navigator.userAgent);

	if (navigator.hasOwnProperty('connection')) {
		data.set('connection', navigator.connection.type);
	} else {
		data.set('connection', 'unknown');
	}

	console.info(Object.fromEntries(data.entries()));
	return navigator.sendBeacon(url, data);
}

window.addEventListener('error', reportError);

if (document.documentElement.dataset.hasOwnProperty('serviceWorker')) {
	registerServiceWorker(document.documentElement.dataset.serviceWorker).catch(console.error);
}

document.documentElement.classList.replace('no-js', 'js');
document.body.classList.toggle('no-dialog', document.createElement('dialog') instanceof HTMLUnknownElement);
document.body.classList.toggle('no-details', document.createElement('details') instanceof HTMLUnknownElement);



ready().then(async () => {
	$('[data-scroll-to]').click(event => {
		const target = document.querySelector(event.target.closest('[data-scroll-to]').dataset.scrollTo);
		target.scrollIntoView({
			bahavior: 'smooth',
			block: 'start',
		});
	});

	$('[data-show]').click(event => {
		const target = document.querySelector(event.target.closest('[data-show]').dataset.show);
		if (target instanceof HTMLElement) {
			target.show();
		}
	});

	$('[data-show-modal]').click(event => {
		const target = document.querySelector(event.target.closest('[data-show-modal]').dataset.showModal);
		if (target instanceof HTMLElement) {
			target.showModal();
		}
	});

	$('[data-close]').click(event => {
		const target = document.querySelector(event.target.closest('[data-close]').dataset.close);
		if (target instanceof HTMLElement) {
			target.tagName === 'DIALOG' ? target.close() : target.open = false;
		}
	});
});
