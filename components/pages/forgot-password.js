import {ENDPOINT} from '/js/consts.js';
import Router from '/js/Router.js';
import {loggedIn} from '/js/functions.js';

async function getResetInfo(token) {
	const url = new URL('ResetPassword', ENDPOINT);
	url.searchParams.set('token', token);
	const resp = await fetch(url, {mode: 'cors'});
	if (resp.ok) {
		const {email, expires} = await resp.json();
		return {email, expires};
	} else {
		return {
			email: null,
			expires: null,
		};
	}
}

class ForgotPasswordPage extends HTMLElement {
	constructor(token = null) {
		super();
		this.attachShadow({mode: 'open'});

		fetch(new URL('forgot-password.html', import.meta.url)).then(async resp => {
			const parser = new DOMParser();
			const html = await resp.text();
			const doc = parser.parseFromString(html, 'text/html');
			const frag = document.createDocumentFragment();

			if (token) {
				doc.forms.forgotPassword.remove();
				doc.forms.resetPassword.hidden = false;
				const {email} = await getResetInfo(token);
				console.log({email, token});
				doc.getElementById('token').value = token;
				doc.getElementById('reset-username').value = email;

				doc.forms.resetPassword.addEventListener('submit', async event => {
					event.preventDefault();
					const resp = await fetch(new URL('ResetPassword/', ENDPOINT), {
						method: 'POST',
						mode: 'cors',
						headers: new Headers({
							Accept: 'application/json',
						}),
						body: new FormData(event.target),
					});

					if (resp.ok) {
						await customElements.whenDefined('toast-message');
						const Toast = customElements.get('toast-message');
						await Toast.toast('Password has been reset. Please login.');
						location.hash = '#login';
					} else {
						throw new Error(`${resp.url} [${resp.status} ${resp.statusText}`);
					}
				});
			} else {
				doc.forms.forgotPassword.hidden = false;
				doc.forms.resetPassword.remove();
				doc.forms.forgotPassword.addEventListener('submit', async event => {
					event.preventDefault();
					const resp = await fetch(new URL('ResetPassword/', ENDPOINT), {
						method: 'POST',
						mode: 'cors',
						headers: new Headers({
							Accept: 'application/json',
						}),
						body: new FormData(event.target),
					});

					if (resp.ok) {
						await customElements.whenDefined('toast-message');
						const Toast = customElements.get('toast-message');
						await Toast.toast('If a user exists with that address, a reset email has been sent.');
						location.hash = '#login';
					} else {
						throw new Error(`${resp.url} [${resp.status} ${resp.statusText}`);
					}
				});
			}
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
