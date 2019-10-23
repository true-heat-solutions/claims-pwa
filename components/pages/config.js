import Router from '/js/Router.js';
import {$} from '/js/std-js/functions.js';
import {ENDPOINT} from '/js/consts.js';
import {userCan, loggedIn, getToken} from '/js/functions.js';

async function getCredentials() {
	const url = new URL('/SMTP/', ENDPOINT);
	url.searchParams.set('token', getToken());
	const resp = await fetch(url, {
		mode: 'cors',
		headers: new Headers({
			Accept: 'application/json',
		}),
	});

	if (resp.ok) {
		const {username, host, port, starTLS} = await resp.json();
		return {username, host, port, starTLS};
	} else {
		console.error(Error(`${resp.url} [${resp.status} ${resp.statusText}]`));
		return {
			username: null,
			host: null,
			port: NaN,
			starTLS: null,
		};
	}
}

class ConfigPage extends HTMLElement {
	constructor() {
		super();

		this.attachShadow({mode: 'open'});

		fetch(new URL('config.html', import.meta.url)).then(async resp => {
			const parser = new DOMParser();
			const html = await resp.text();
			const doc = parser.parseFromString(html, 'text/html');
			const frag = document.createDocumentFragment();
			frag.append(...doc.head.children, ...doc.body.children);

			const {username, host, port, starTLS} = await getCredentials();
			console.info({username, host, port, starTLS});
			this.set('username', username);
			this.set('host', host);
			this.set('port', port);
			this.set('starTLS', starTLS);

			$('form[name="email"]', frag).submit(async event => {
				event.preventDefault();
				const body = new FormData(event.target);
				body.set('token', getToken());
				const resp = await fetch(new URL('SMTP/', ENDPOINT), {
					method: 'POST',
					mode: 'cors',
					body,
					headers: new Headers({
						Accept: 'application/json',
					}),
				});

				if (resp.ok) {
					location.hash = '#account';
				} else {
					throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
				}
			});

			this.shadowRoot.append(frag);
			this.dispatchEvent(new Event('ready'));
		});
	}

	get ready() {
		return new Promise(resolve => {
			if (this.loaded) {
				resolve();
			} else {
				this.addEventListener('ready', () => resolve(), {once: true});
			}
		});
	}

	get loaded() {
		return this.shadowRoot !== null && this.shadowRoot.childElementCount !== 0;
	}

	async set(name, value) {
		await this.ready;
		const el = this.shadowRoot.querySelector(`input[name="${name}"]`);
		if (el instanceof HTMLElement) {
			if (el instanceof HTMLInputElement && el.type === 'checkbox') {
				el.checked = value;
			} else {
				el.value = value;
			}
		} else {
			throw new Error(`Not input named: ${name}`);
		}
	}
}

customElements.define('config-page', ConfigPage);

Router.setRoute('config', async (...args) => {
	if (loggedIn() && userCan('config')) {
		const el = new ConfigPage(...args);
		const app = document.body;
		[...app.children].forEach(el => el.remove());
		app.append(el);
	} else {
		location.href = '#login';
	}
});
