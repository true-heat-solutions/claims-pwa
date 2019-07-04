import '/js/std-js/deprefixer.js';
import '/js/std-js/shims.js';
import './share-button.js';
import './current-year.js';
import './gravatar-img.js';
import './imgur-img.js';
import '/components/form-json.js';
import {$, ready, registerServiceWorker} from '/js/std-js/functions.js';

if (document.documentElement.dataset.hasOwnProperty('serviceWorker')) {
	registerServiceWorker(document.documentElement.dataset.serviceWorker).catch(console.error);
}

document.documentElement.classList.replace('no-js', 'js');
document.body.classList.toggle('no-dialog', document.createElement('dialog') instanceof HTMLUnknownElement);
document.body.classList.toggle('no-details', document.createElement('details') instanceof HTMLUnknownElement);

async function importHTML(src) {
	const resp = await fetch(new URL(src, document.baseURI));
	if (resp.ok) {
		const parser = new DOMParser();
		const frag = document.createDocumentFragment();
		const doc = parser.parseFromString(await resp.text(), 'text/html');
		frag.append(...doc.head.children, ...doc.body.children);
		return frag;
	} else {
		throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
	}
}

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

	const login = await importHTML('/components/login/login.html');
	document.body.append(login);
	document.forms.login.addEventListener('success', console.info);
});
