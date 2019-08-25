import '/js/std-js/deprefixer.js';
import '/js/std-js/shims.js';
import './share-button.js';
import './current-year.js';
import './gravatar-img.js';
import './imgur-img.js';
import '/components/pages/login.js';
import '/components/error-message.js';
import '/components/toast-message.js';
import '/components/pages/claims.js';
import '/components/pages/account.js';
import '/components/pages/forgot-password.js';
import '/components/app-footer.js';
import '/components/logout-button.js';
import './routes.js';
import {$, ready, registerServiceWorker} from '/js/std-js/functions.js';

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
