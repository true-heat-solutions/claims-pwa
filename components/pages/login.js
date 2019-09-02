import Router from '/js/Router.js';
import {USERS} from '/users.js';
class LoginPage extends HTMLElement {
	constructor(username = null, redirect = 'claims') {
		super();
		console.log({username, redirect});
		this.attachShadow({mode: 'open'});
		this.redirect = redirect;

		fetch(new URL('login.html', import.meta.url)).then(async resp => {
			const parser = new DOMParser();
			const html = await resp.text();
			const doc = parser.parseFromString(html, 'text/html');
			const frag = document.createDocumentFragment();
			const form = doc.forms.login;
			form.addEventListener('submit', async event => {
				event.preventDefault();
				const data = new FormData(form);
				const email = data.get('username').toLowerCase();
				try {
					const user = await USERS.find(item => item.person.email === email);
					console.log(user);
					if (user !== undefined) {
						this.dispatchEvent(new CustomEvent('success', {detail: {body: user,}}));
					} else {
						throw new Error('User not found');
					}
					// const resp = await fetch(form.action, {
					// 	headers: new Headers({
					// 		Accept: 'application/json',
					// 		'Content-Type': 'application/json',
					// 	}),
					// 	method: 'POST',
					// 	mode: 'cors',
					// 	body: JSON.stringify(this),
					// });

					// if (resp.ok) {
					// 	const body = await resp.json();
					// 	this.dispatchEvent(new CustomEvent('success', {detail: {
					// 		url: new URL(resp.url),
					// 		ok: resp.ok,
					// 		status: resp.status,
					// 		statusText: resp.statusText,
					// 		redirected: resp.redirected,
					// 		type: resp.type,
					// 		headers: Object.fromEntries(resp.headers.entries()),
					// 		body: body,
					// 	}}));
					// } else {
					// 	const detail = await resp.json();
					// 	if (detail.hasOwnProperty('error')) {
					// 		this.dispatchEvent(new CustomEvent('fail', {detail}));
					// 	}
					// }
				} catch(err) {
					await customElements.whenDefined('toast-message');
					const Toast = customElements.get('toast-message');
					await Toast.toast(err.message);
				}
			});

			this.addEventListener('fail', async ({target, detail}) => {
				target.form.querySelector('error-message').message = detail.error.message;
			});

			this.addEventListener('success', ({target, detail}) => {
				console.info(detail);
				target.form.querySelector('error-message').clear();
				localStorage.setItem('token', detail.body.token);
				localStorage.setItem('givenName', detail.body.person.givenName);
				localStorage.setItem('additionalName', detail.body.person.additionalName);
				localStorage.setItem('familyName', detail.body.person.familyName);
				localStorage.setItem('email', detail.body.person.email);
				localStorage.setItem('telephone', detail.body.person.telephone);

				location.hash = this.redirect;
			});

			frag.append(...doc.head.children, ...doc.body.children);
			this.shadowRoot.append(frag);
			if (typeof username === 'string') {
				this.username = username;
			}
			this.dispatchEvent(new Event('ready'));
		});
	}

	get ready() {
		return new Promise(resolve => {
			if (this.shadowRoot instanceof ShadowRoot && this.shadowRoot.childElementCount !== 0) {
				resolve();
			} else {
				this.addEventListener('ready', () => resolve(), {once: true});
			}
		});
	}

	set username(username) {
		this.shadowRoot.querySelector('[name="username"]').value = username;
	}

	get form() {
		return this.shadowRoot.querySelector('form');
	}

	get redirect() {
		return this.hasAttribute('redirect') ? `#${this.getAttribute('redirect')}` : '#claims';
	}

	set redirect(val) {
		if (typeof val === 'string') {
			this.setAttribute('redirect', val);
		} else {
			this.removeAttribute('redirect');
		}
	}

	toJSON() {
		return Object.fromEntries(new FormData(this.shadowRoot.querySelector('form')).entries());
	}
}

customElements.define('login-page', LoginPage);

Router.setRoute('login', async (username = null, redirect = 'claims') => {
	if (localStorage.hasOwnProperty('token')) {
		location.href = `#${redirect}`;
	} else {
		const el = new LoginPage(username, redirect);
		const app = document.body;
		[...app.children].forEach(el => el.remove());
		app.append(el);
	}
});
