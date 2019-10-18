import {ENDPOINT} from '/js/consts.js';
import Router from '/js/Router.js';
import {loggedIn} from '/js/functions.js';

class ForgotPasswordPage extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'});

		fetch(new URL('forgot-password.html', import.meta.url)).then(async resp => {
			const parser = new DOMParser();
			const html = await resp.text();
			const doc = parser.parseFromString(html, 'text/html');
			const frag = document.createDocumentFragment();

			doc.forms.forgotPassword.addEventListener('submit', async event => {
				event.preventDefault();
				const resp = await fetch(new URL('/forgot/', ENDPOINT), {
					method: 'POST',
					mode: 'cors',
					headers: new Headers({
						Accept: 'application/json',
					}),
					body: new FormData(event.target),
				});

				if (resp.ok) {
					const data = await resp.json();
					await customElements.whenDefined('toast-message');
					const Toast = customElements.get('toast-message');
					const toast = new Toast();
					const msg = document.createElement('div');
					const title = document.createElement('h3');
					const p = document.createElement('p');
					const img = new Image();
					img.height = 64;
					img.width = 64;
					msg.classList.add('center');
					img.decoding = 'async';
					img.src = new URL(data.notification.icon, document.baseURI);
					title.textContent = data.notification.title;
					p.textContent = data.notification.body;
					msg.append(title, img, p);
					msg.slot = 'content';
					toast.append(msg);
					document.body.append(toast);
					await toast.show();
					await toast.closed;
					toast.remove();
				} else {
					throw new Error(`${resp.url} [${resp.status} ${resp.statusText}`);
				}

			});
			frag.append(...doc.head.children, ...doc.body.children);

			this.shadowRoot.append(frag);
		});
	}

	toJSON() {
		return Object.fromEntries(new FormData(this.shadowRoot.querySelector('form')).entries());
	}
}

customElements.define('forgot-password-page', ForgotPasswordPage);

Router.setRoute('forgot-password', async (...args) => {
	if (loggedIn()) {
		location.href = '#claims';
	} else {
		const el = new ForgotPasswordPage(...args);
		const app = document.body;
		[...app.children].forEach(el => el.remove());
		app.append(el);
	}
});
