import {ENDPOINT} from '/js/consts.js';
import Router from '/js/Router.js';

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
				await customElements.whenDefined('toast-message');
				const Toast = customElements.get('toast-message');
				const toast = new Toast();
				const pre = document.createElement('pre');
				const code = document.createElement('code');
				pre.slot = 'content';
				const resp = await fetch(new URL('/test', ENDPOINT), {
					method: 'POST',
					mode: 'cors',
					headers: new Headers({
						Accept: 'application/json',
						'Content-Type': 'application/json',
					}),
					body: JSON.stringify(this),
				});
				const data = await resp.json();
				code.textContent = JSON.stringify(data, null, 2);
				pre.append(code);
				toast.append(pre);
				document.body.append(toast);
				await toast.show();
				await toast.closed;
				toast.remove();
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
	if (localStorage.hasOwnProperty('token')) {
		location.href = '#claims';
	} else {
		const el = new ForgotPasswordPage(...args);
		const app = document.body;
		[...app.children].forEach(el => el.remove());
		app.append(el);
	}
});
