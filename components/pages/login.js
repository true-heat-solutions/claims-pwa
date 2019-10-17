import Router from '/js/Router.js';
// import {USERS} from '/users.js';
import {ENDPOINT} from '/js/consts.js';
const DATA = {
	uuid: '',
	name: '',
	token: '',
	permissions: [],
};

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
				try {
					const resp = await fetch(new URL('/login/', ENDPOINT), {
						headers: new Headers({
							Accept: 'application/json',
							'Content-Type': 'application/json',
						}),
						method: 'POST',
						mode: 'cors',
						body: JSON.stringify(this),
					});

					if (resp.ok) {
						const body = await resp.json();
						this.dispatchEvent(new CustomEvent('success', {detail: {
							url: new URL(resp.url),
							ok: resp.ok,
							status: resp.status,
							statusText: resp.statusText,
							redirected: resp.redirected,
							type: resp.type,
							headers: Object.fromEntries(resp.headers.entries()),
							body: body,
						}}));
					} else {
						const detail = await resp.json();
						if (detail.hasOwnProperty('error')) {
							this.dispatchEvent(new CustomEvent('fail', {detail}));
						}
					}
				} catch(err) {
					await customElements.whenDefined('toast-message');
					const Toast = customElements.get('toast-message');
					await Toast.toast(err.message);
					console.error(err);
				}
			});

			this.addEventListener('fail', async ({target, detail}) => {
				target.form.querySelector('error-message').message = detail.error.message;
			});

			this.addEventListener('success', ({target, detail}) => {
				target.form.querySelector('error-message').clear();
				localStorage.setItem('identifier', detail.body.person.identifier);
				localStorage.setItem('token', detail.body.token);
				localStorage.setItem('givenName', detail.body.person.givenName);
				localStorage.setItem('additionalName', detail.body.person.additionalName);
				localStorage.setItem('familyName', detail.body.person.familyName);
				localStorage.setItem('email', detail.body.person.email);
				localStorage.setItem('telephone', detail.body.person.telephone);
				this.permissions = Object.entries(detail.body.permissions)
					.filter(([k, v]) => typeof k === 'string' && v === true)
					.map(([k]) => k);

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

	get permissions() {
		return DATA.permissions;
	}

	set permissions(perms) {
		if (Array.isArray(perms)) {
			DATA.permissions = perms;
			localStorage.setItem('permissions', perms);
		} else {
			throw new Error('Permissions must be an array');
		}
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
