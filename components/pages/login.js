import Router from '/js/Router.js';
import {notify} from '/js/std-js/functions.js';
import HTMLGravatarImageElement from '/js/gravatar-img.js';

class LoginPage extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'});

		fetch(new URL('login.html', import.meta.url)).then(async resp => {
			const parser = new DOMParser();
			const html = await resp.text();
			const doc = parser.parseFromString(html, 'text/html');
			const frag = document.createDocumentFragment();

			frag.append(...doc.head.children, ...doc.body.children);
			const form = frag.querySelector('form');
			form.addEventListener('submit', async event => {
				event.preventDefault();

				try {
					const resp = await fetch(form.action, {
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
					console.error(err);
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

				notify(`Welcome back, ${detail.body.person.honorificPrefix} ${detail.body.person.familyName}`, {
					body: 'We missed you!',
					icon: HTMLGravatarImageElement.url({
						email: detail.body.person.email,
						size: 64,
					}),
				});
				location.hash = '#claims';
			});

			this.shadowRoot.append(frag);
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

	toJSON() {
		return Object.fromEntries(new FormData(this.shadowRoot.querySelector('form')).entries());
	}
}

customElements.define('login-page', LoginPage);

Router.setRoute('login', async (...args) => {
	const el = new LoginPage(...args);
	const app = document.getElementById('app');
	[...app.children].forEach(el => el.remove());
	app.append(el);
});
